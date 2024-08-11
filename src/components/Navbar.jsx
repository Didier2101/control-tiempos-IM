import { Box, Link as MuiLink } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';


const Navbar = () => {

    const location = useLocation();
    const isCafeActive = location.pathname === "/";
    const isBreakActive = location.pathname === "/datos2";

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "bold",
                width: '98%',
                margin: '0 auto', // Añadir el borderRadius
                marginBottom: '14px',
                marginTop: '14px',
            }}
        >
            <MuiLink
                component={Link}
                to="/"
                sx={{
                    width: isCafeActive ? "30%" : "70%",
                    textAlign: isCafeActive ? "center" : "left",
                    textDecoration: "none",
                    padding: '10px',
                    backgroundColor: isCafeActive ? "secondary.main" : "background.default",
                    color: isCafeActive ? "info.main" : "secondary.main",
                    transition: 'width 1s ease, background-color 1s ease',
                    fontSize: 30,
                    borderRadius: isCafeActive ? '6px' : '0px',
                    position: 'relative', // Necesario para zIndex
                    zIndex: isCafeActive ? 2 : 1,
                    // paddingLeft: '10px'
                }}
            >
                Cafe
            </MuiLink>
            <MuiLink
                component={Link}
                to="/datos2"
                sx={{
                    width: isBreakActive ? "30%" : "70%", // Para que el Link ocupe la mitad del espacio
                    textAlign: isBreakActive ? "center" : "right",
                    textDecoration: "none",
                    backgroundColor: isBreakActive ? "secondary.main" : "background.default",
                    padding: '10px',
                    color: isBreakActive ? "info.main" : "secondary.main",
                    transition: 'width 1s ease, background-color 1s ease',
                    fontSize: 30,
                    borderRadius: isBreakActive ? '6px' : '0px',
                    position: 'relative', // Necesario para zIndex
                    zIndex: isBreakActive ? 2 : 1, // Mayor zIndex para el activo
                }}
            >
                Break
            </MuiLink>
        </Box>
    )
}

export default Navbar