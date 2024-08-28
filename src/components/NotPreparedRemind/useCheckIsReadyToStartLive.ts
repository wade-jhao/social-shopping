import { PLATFORM } from "@pages/LiveRoom/apis/legacy";
import { checkIgConversationAuthValid } from "@components/NotPreparedRemind/apis/facebook";
import {
  fetchSettingFacebookLoginStatus,
  fetchSettingSchedulerStatus,
} from "@components/NotPreparedRemind/apis/legacy";
import { selectApis } from "@store/apiSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  getAllSocialAccountsAtOnceAsync,
  selectIsPrepared,
  selectSocialAccounts,
  setIsPrepared,
} from "@store/liveroomSlice";
import { useEffect, useState } from "react";
const isDevEnv = false;
// || window.location.host.startsWith("dev");
const isNoNeedCheckedPage =
  !window.location.pathname.includes("/activities") ||
  (window.location.pathname.includes("/liveroom/activities/") &&
    window.location.pathname.includes("/post")) ||
  window.location.pathname.includes("/liveroom/draft/activities") ||
  window.location.pathname.includes("/livehost/activities") ||
  window.location.pathname.includes("/errors/accessTokenExpired"); // 不需要檢查的頁面: 首頁、直播間

function useCheckIsReadyToStartLive() {
  const dispatch = useAppDispatch();
  const apis = useAppSelector(selectApis);
  const socialAccounts = useAppSelector(selectSocialAccounts);
  const isPrepared = useAppSelector(selectIsPrepared);
  const [
    isAllOfIgAccountConversationAuthValid,
    setIsAllOfIgAccountConversationAuthValid,
  ] = useState<null | boolean>(null);
  const [settingFacebookLoginStatus, setSettingFacebookLoginStatus] = useState<
    null | boolean
  >(null);
  const [settingSchedulerStatus, setSettingSchedulerStatus] = useState<
    null | boolean
  >(null);
  // 檢查有無綁定外部網站
  const isBindAnyOfSocialAccounts =
    socialAccounts &&
    Object.values(socialAccounts).some((channel) => channel.length > 0);
  // 檢查有無任意外部網站的權限過期
  const isAllOfSocialAccountsTokenValid =
    socialAccounts &&
    Object.values(socialAccounts).every((channel) =>
      channel.every((account) => account.access_token !== null)
    );
  // 外部網站若有綁定IG，則檢查該IG帳號是否有權限發送訊息
  const isSocialAccountHasIgAccount =
    socialAccounts &&
    socialAccounts?.instagram &&
    socialAccounts?.instagram.length > 0;
  const checkIsAllOfIgAccountConversationAuthValid = async (
    platform: PLATFORM
  ) => {
    return await new Promise((resolve) =>
      checkIgConversationAuthValid(
        platform.access_token || "",
        platform.id || "",
        (res: boolean) => {
          resolve(res);
        }
      )
    );
  };
  // 檢查是否已經準備好直播前置作業
  const isReadyToStartLive =
    isNoNeedCheckedPage ||
    (isBindAnyOfSocialAccounts &&
      isAllOfSocialAccountsTokenValid &&
      isAllOfIgAccountConversationAuthValid);

  useEffect(() => {
    if (isReadyToStartLive) {
      dispatch(setIsPrepared(true));
    }
  }, [isReadyToStartLive]);

  useEffect(() => {
    if (!apis || socialAccounts || isPrepared || isNoNeedCheckedPage) return;
    dispatch(
      getAllSocialAccountsAtOnceAsync({
        url: apis?.social_accounts as string,
      })
    );
  }, [apis, dispatch, socialAccounts, isPrepared]);

  useEffect(() => {
    if (!apis || !socialAccounts || isPrepared || isNoNeedCheckedPage) {
      return;
    }
    if (settingSchedulerStatus === null) {
      fetchSettingSchedulerStatus(apis.setting_scheduler as string).then(
        (res) => {
          setSettingSchedulerStatus(res.status || false);
        }
      );
    }
  }, [apis, socialAccounts, settingSchedulerStatus, isPrepared]);

  useEffect(() => {
    if (!apis || !socialAccounts || isPrepared || isNoNeedCheckedPage) {
      return;
    }
    if (settingFacebookLoginStatus === null) {
      fetchSettingFacebookLoginStatus(
        apis.setting_facebook_login as string
      ).then((res) => {
        setSettingFacebookLoginStatus(res.status || false);
      });
    }
  }, [apis, socialAccounts, settingFacebookLoginStatus, isPrepared]);

  useEffect(() => {
    if (!apis || !socialAccounts || isPrepared || isNoNeedCheckedPage) {
      return;
    }
    if (socialAccounts?.instagram && socialAccounts?.instagram.length === 0) {
      setIsAllOfIgAccountConversationAuthValid(true);
      return;
    }
    if (isAllOfIgAccountConversationAuthValid === null) {
      Promise.all(
        socialAccounts.instagram.map((account) => {
          return checkIsAllOfIgAccountConversationAuthValid(account);
        })
      ).then((res) => {
        setIsAllOfIgAccountConversationAuthValid(res.every((r) => r));
      });
    }
  }, [apis, socialAccounts, isAllOfIgAccountConversationAuthValid, isPrepared]);

  const readyStartLiveCheckList = {
    isBindAnyOfSocialAccounts,
    isAllOfSocialAccountsTokenValid,
    isAllOfIgAccountConversationAuthValid,
    isSocialAccountHasIgAccount,
    settingFacebookLoginStatus,
    settingSchedulerStatus,
  };
  return {
    isReadyToStartLive: isDevEnv ? true : isReadyToStartLive,
    readyStartLiveCheckList,
  };
}
export default useCheckIsReadyToStartLive;
