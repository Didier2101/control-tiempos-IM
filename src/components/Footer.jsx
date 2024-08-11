import { Box, Typography } from "@mui/material";
import logo from '../assets/BUG WEB BLANCO.png';

const Footer = () => {
    return (
        <Box
            sx={{
                bottom: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'background.paper',
                color: 'text.primary',
                textAlign: 'center',
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '10px', // Espacio entre la imagen y el texto
                zIndex: 10,
                marginTop: '10px'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px' // Espacio entre la imagen y el texto
                }}
            >
                <img src={logo} alt="Logo" style={{ width: '100px', height: '60px' }} />
                <Typography variant="body2">Todos los derechos reservados - 2024</Typography>
            </Box>
            <Typography variant="body2">Desarrollado por Didier Chavez</Typography>
        </Box>
    );
};

export default Footer;
