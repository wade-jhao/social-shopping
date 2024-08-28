import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Tabs, Tab } from "@mui/material";

// Create a custom theme
const theme = createTheme({
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          // Add padding here to create the desired space between the icon and indicator
          paddingRight: "50px", // adjust this value as necessary
        },
      },
    },
  },
});

interface PROPS {
  value: number;
  tabList: { label: string; icon: any }[];
  onTabChange: Function;
}

export default function OptionTabs(props: PROPS) {
  const { value, tabList, onTabChange } = props;
  return (
    <ThemeProvider theme={theme}>
      <Tabs
        sx={{ width: "54px" }}
        value={value}
        onChange={(event: React.SyntheticEvent, newValue: number) =>
          onTabChange(newValue)
        }
        aria-label="option tabs"
        orientation="vertical"
      >
        {tabList.map((option, index) => (
          <Tab
            id={`${option.label}-action`}
            icon={option.icon}
            aria-label={option.label}
            key={index}
            iconPosition={"start"}
          />
        ))}
      </Tabs>
    </ThemeProvider>
  );
}
