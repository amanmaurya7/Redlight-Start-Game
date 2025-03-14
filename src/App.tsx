import { useEffect } from "react";
import RedLight from "./components/RedLight";
import "./App.css";

function App() {
  // Apply some global styles to ensure full-screen display
  useEffect(() => {
    // Remove any default margins or padding
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    
    // Force full height on mobile devices
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    
    return () => {
      // Cleanup when component unmounts
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.height = "";
    };
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      padding: 0,
      margin: 0,
      overflow: "hidden",
    }}>
      <RedLight />
    </div>
  );
}

export default App;