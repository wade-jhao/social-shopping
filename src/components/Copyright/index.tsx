import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

interface PROPS {
  link: string;
  title: string;
  [x: string]: any;
}

function Copyright(props: PROPS) {
  const { link, title } = props;

  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href={link}>
        {title}
      </Link>
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default Copyright;
