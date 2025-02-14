import React, { useState } from "react";
import { Box, Typography, TextField, Button, IconButton, styled, useTheme } from "@mui/material";
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
} from "@mui/icons-material";

const PageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  overflow: "hidden",
}));

const VideoBackground = styled("video")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: -1, // Keeps the video in the background
});

const Container = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  maxWidth: "1000px",
  height: "auto",
  background: "#fff",
  borderRadius: "30px",
  boxShadow: "0 0 30px rgba(0, 0, 0, 0.2)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.up("md")]: {
    height: "700px",
    flexDirection: "row",
  },
}));

const FormBox = styled(Box)(({ theme }) => ({
  flex: 1,
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#333",
  textAlign: "center",
  padding: "40px",
  zIndex: 1,
  [theme.breakpoints.down("sm")]: {
    padding: "20px",
  },
}));

const InputBox = styled(Box)(({ theme }) => ({
  position: "relative",
  margin: "15px 0",
  width: "100%",
  "& input": {
    width: "100%",
    padding: "12px 50px 12px 15px",
    background: "#f3f4f6",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    color: "#333",
    fontWeight: 500,
    [theme.breakpoints.down("sm")]: {
      padding: "10px 40px 10px 10px",
      fontSize: "14px",
    },
  },
}));

const ToggleBox = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#1e3a8a",
  color: "#fff",
  padding: "40px",
  textAlign: "center",
  [theme.breakpoints.down("sm")]: {
    padding: "20px",
  },
}));

const LoginSignupForm = () => {
  const [isActive, setIsActive] = useState(false);
  const theme = useTheme();

  return (
    <PageContainer>
      <VideoBackground autoPlay loop muted>
        <source src="fib.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </VideoBackground>

      <Container>
        <FormBox>
          <form action="#">
            <Typography variant="h4" sx={{ color: "#1e3a8a", fontWeight: "bold" }}>
              {isActive ? "Registration" : "Login"}
            </Typography>
            <InputBox>
              <TextField type="text" placeholder="Username" required fullWidth />
            </InputBox>
            {isActive && (
              <InputBox>
                <TextField type="email" placeholder="Email" required fullWidth />
              </InputBox>
            )}
            <InputBox>
              <TextField type="password" placeholder="Password" required fullWidth />
            </InputBox>
            <Button
              type="submit"
              fullWidth
              sx={{ background: "#1e3a8a", color: "#fff", fontWeight: "bold", mt: 2 }}
            >
              {isActive ? "Register" : "Login"}
            </Button>
            <Typography sx={{ color: "#666", mt: 2 }}>or use social login</Typography>
            <Box>
              <IconButton><GoogleIcon sx={{ color: "#1e3a8a" }} /></IconButton>
              <IconButton><FacebookIcon sx={{ color: "#1e3a8a" }} /></IconButton>
              <IconButton><GitHubIcon sx={{ color: "#1e3a8a" }} /></IconButton>
              <IconButton><LinkedInIcon sx={{ color: "#1e3a8a" }} /></IconButton>
            </Box>
          </form>
        </FormBox>
        <ToggleBox>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {isActive ? "Welcome Back!" : "Hello, Welcome!"}
          </Typography>
          <Typography>{isActive ? "Already have an account?" : "Don't have an account?"}</Typography>
          <Button
            sx={{ border: "2px solid white", color: "white", mt: 2 }}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? "Login" : "Register"}
          </Button>
        </ToggleBox>
      </Container>
    </PageContainer>
  );
};

export default LoginSignupForm;