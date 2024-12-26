import { Box, useMediaQuery } from "@mui/material";
import Row1 from "./Row1";
import Row2 from "./Row2";
import Row3 from "./Row3";
import { useLocation } from "react-router-dom";

const gridTemplateLargeScreens = `
  "a b b"
  "a b b"
  "a b b"
  "a b b"
  "c b b"
  "c b b"
  "c d d"
  "c d d"
  "c d d"
  "c d d"
`;
const gridTemplateSmallScreens = `
  "a"
  "a"
  "a"
  "a"
  "b"
  "b"
  "b"
  "b"
  "b"
  "b"
  "b"
  "b"
  "b"
  "b"
  "b"
  "b"
  "c"
  "c"
  "c"
  "c"
  "c"
  "c"
  "d"
  "d"
  "d"
  "d"
  "d"
  "d"
  "d"
  "d"
`;

const Dashboard = () => {
  const location = useLocation();
  const username = location.state?.username;
  const phone = location.state?.phone;
  const email = location.state?.email;
  const password = location.state?.password;
  const alertType = location.state?.alertType;
  const triggerType = location.state?.triggerType;
  const isAboveMediumScreens = useMediaQuery("(min-width: 1200px)");
  return (
    <Box
      width="100%"
      height="100%"
      display="grid"
      gap="1.5rem"
      sx={
        isAboveMediumScreens
          ? {
              gridTemplateColumns: "repeat(3, minmax(370px, 1fr))",
              gridTemplateRows: "repeat(10, minmax(60px, 1fr))",
              gridTemplateAreas: gridTemplateLargeScreens,
            }
          : {
              gridAutoColumns: "2fr",
              gridAutoRows: "80px",
              gridTemplateAreas: gridTemplateSmallScreens,
            }
      }
    >
      <Row1
        username={username}
        phone={phone}
        email={email}
        password={password}
        alertType={alertType}
        triggerType={triggerType}
      />
      <Row2 />
      <Row3 />
    </Box>
  );
};

export default Dashboard;
