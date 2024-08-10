import { Box } from "@mui/material"
import Datos1 from "./Datos1"
import Datos2 from "./Datos2"
import Navbar from "./Navbar"

import { Routes, Route } from 'react-router-dom';

const Main = () => {
    return (
        <Box
            sx={{ padding: '8px', height: 'auto' }}

        >
            <Navbar />
            <Routes>
                <Route path="/" element={<Datos1 />} />
                <Route path="/datos2" element={<Datos2 />} />
            </Routes>
        </Box>
    )
}

export default Main