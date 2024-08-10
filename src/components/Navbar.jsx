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
                fontSize: "1.4rem",
                borderRadius: "16px 16px 0px 0px",
                width: '80%',
                margin: '0 auto', // Añadir el borderRadius
                marginBottom: '10px'
            }}
        >
            <MuiLink
                component={Link}
                to="/"
                sx={{
                    width: isCafeActive ? "50%" : "50%",
                    textAlign: "left",
                    textDecoration: "none",
                    padding: '10px',
                    backgroundColor: isCafeActive ? "secondary.main" : "background.default",
                    color: isCafeActive ? "info.main" : "secondary.main",
                    transition: 'width 0.5s ease, background-color 0.5s ease, border-radius 0.5s ease',
                    fontSize: 30,
                    borderRadius: isCafeActive ? '16px' : '0px',
                    position: 'relative', // Necesario para zIndex
                    zIndex: isCafeActive ? 2 : 1, // Mayor zIndex para el activo
                }}
            >
                Cafe
            </MuiLink>
            <MuiLink
                component={Link}
                to="/datos2"
                sx={{
                    width: isBreakActive ? "50%" : "50%", // Para que el Link ocupe la mitad del espacio
                    textAlign: "right",
                    textDecoration: "none",
                    backgroundColor: isBreakActive ? "secondary.main" : "background.default",
                    padding: '10px',
                    color: isBreakActive ? "info.main" : "secondary.main",
                    transition: 'width 0.5s ease, background-color 0.5s ease, border-radius 0.5s ease',
                    fontSize: 30,
                    borderRadius: isBreakActive ? '16px' : '0px',
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