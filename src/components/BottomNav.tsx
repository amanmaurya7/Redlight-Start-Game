/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";

import HomeIcon from "../images/home-icon.svg";
import CircuitIcon from "../images/circuit-icon.svg";
import MenuIcon from "../images/menu-icon.svg";
import DriverIcon from "../images/driver-icon.svg";

const BottomNav: React.FC = () => {
    const [value, setValue] = React.useState(0);

    return (
        <Paper 
            sx={{ 
                position: "fixed", 
                bottom: 0, 
                left: 0, 
                right: 0, 
                zIndex: 1000, 
                width: "100%",
                borderRadius: 0,
            }} 
            elevation={0}
        >
            <BottomNavigation
                value={value}
                onChange={(_, newValue) => setValue(newValue)}
                showLabels
                sx={{ 
                    backgroundColor: "#ff0000", 
                    color: "white",
                    height: "56px",
                }}
            >
                <BottomNavigationAction 
                    label="HOME" 
                    icon={<img src={HomeIcon} alt="Home" width={20} height={20} />} 
                    sx={{ 
                        color: "white",
                        "& .MuiBottomNavigationAction-label": { 
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            marginTop: "4px"
                        },
                    }} 
                />
                <BottomNavigationAction 
                    label="DRIVER" 
                    icon={<img src={DriverIcon} alt="Driver" width={20} height={20} />} 
                    sx={{ 
                        color: "white",
                        "& .MuiBottomNavigationAction-label": { 
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            marginTop: "4px"
                        },
                    }} 
                />
                <BottomNavigationAction 
                    label="CIRCUIT" 
                    icon={<img src={CircuitIcon} alt="Circuit" width={20} height={20} />} 
                    sx={{ 
                        color: "white",
                        "& .MuiBottomNavigationAction-label": { 
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            marginTop: "4px"
                        },
                    }} 
                />
                <BottomNavigationAction 
                    label="MENU"
                    icon={<img src={MenuIcon} alt="Menu" width={20} height={20} />} 
                    sx={{ 
                        color: "white",
                        "& .MuiBottomNavigationAction-label": { 
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            marginTop: "4px"
                        },
                    }} 
                />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;