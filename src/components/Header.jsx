import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";

const Header = ({ handleOpen, handleOpenList }) => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());


    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000); // Actualiza cada segundo

        return () => clearInterval(intervalId); // Limpia el intervalo cuando el componente se desmonte
    }, []);


    return (
        <>
            <Box
                p={1}
            >
                <AppBar sx={{
                    position: 'static',
                    borderRadius: 6,
                    width: '80%',
                    margin: '0 auto',
                    backgroundColor: 'secondary.main',
                }}>
                    <Toolbar>

                        <Typography variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '1.4rem',
                                color: "info.main"
                            }}>
                            {currentTime}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            size='normal'
                            variant='outlined'
                            color='info'
                            onClick={handleOpen}
                            sx={{
                                borderRadius: '14px', // Ajusta el valor según tus necesidades
                            }}
                        >
                            Ingresar empleados
                        </Button>
                        <Button
                            size='normal'
                            variant='outlined'
                            color='info'
                            onClick={handleOpenList}
                            sx={{
                                marginLeft: 2,
                                borderRadius: '14px',
                            }}
                        >
                            Lista de empleados
                        </Button>
                    </Toolbar>
                </AppBar>
            </Box>
        </>
    );
}

Header.propTypes = {
    handleOpen: PropTypes.func.isRequired,
    handleOpenList: PropTypes.func.isRequired,
}

export default Header;
