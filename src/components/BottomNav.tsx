import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme } from "@mui/material";

import HomeIcon from "../images/home-icon.svg";
import CircuitIcon from "../images/circuit-icon.svg";
import MenuIcon from "../images/menu-icon.svg";
import DriverIcon from "../images/driver-icon.svg";

const BottomNav: React.FC = () => {
    const [value, setValue] = React.useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Paper 
            sx={{ 
                position: "fixed", 
                bottom: 0, 
                left: 0, 
                right: 0, 
                zIndex: 3, 
                width: "100%" 
            }} 
            elevation={3}
        >
            <BottomNavigation
                value={value}
                onChange={(_, newValue) => setValue(newValue)}
                showLabels
                sx={{ 
                    backgroundColor: "#ff0000", 
                    color: "white",
                    height: isMobile ? "56px" : "64px"
                }}
            >
                <BottomNavigationAction 
                    label="Home" 
                    icon={<img src={HomeIcon} alt="Home" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} />} 
                    sx={{ 
                        "& .MuiBottomNavigationAction-label": { 
                            color: "white",
                            fontSize: isMobile ? "0.7rem" : "0.75rem" 
                        },
                        padding: isMobile ? "6px 0" : "8px 12px" 
                    }} 
                />
                <BottomNavigationAction 
                    label="Circuit" 
                    icon={<img src={CircuitIcon} alt="Circuit" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} />} 
                    sx={{ 
                        "& .MuiBottomNavigationAction-label": { 
                            color: "white",
                            fontSize: isMobile ? "0.7rem" : "0.75rem" 
                        },
                        padding: isMobile ? "6px 0" : "8px 12px" 
                    }} 
                />
                <BottomNavigationAction 
                    label="Driver" 
                    icon={<img src={DriverIcon} alt="Driver" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} />} 
                    sx={{ 
                        "& .MuiBottomNavigationAction-label": { 
                            color: "white",
                            fontSize: isMobile ? "0.7rem" : "0.75rem" 
                        },
                        padding: isMobile ? "6px 0" : "8px 12px"  
                    }} 
                />
                <BottomNavigationAction 
                    icon={<img src={MenuIcon} alt="Menu" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} />} 
                    sx={{ 
                        "& .MuiBottomNavigationAction-label": { 
                            color: "white" 
                        },
                        padding: isMobile ? "6px 0" : "8px 12px" 
                    }} 
                />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;