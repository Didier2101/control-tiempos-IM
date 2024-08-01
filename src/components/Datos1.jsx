import { useState, useEffect, useRef } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from 'jspdf';
import { Box, IconButton, TextField } from '@mui/material';

const Datos1 = () => {
    const [barcode, setBarcode] = useState('');
    const [employeeData, setEmployeeData] = useState([]);
    const [coffeeData, setCoffeeData] = useState({});
    const [scannedEmployees, setScannedEmployees] = useState([]);
    const barcodeRef = useRef(null);

    // Cargar datos desde localStorage cuando el componente se monte
    useEffect(() => {
        const storedEmployeeData = localStorage.getItem('employeeData');
        const storedCoffeeData = localStorage.getItem('coffeeData');
        const storedScannedEmployees = localStorage.getItem('scannedCoffeeEmployees');
        if (storedEmployeeData) {
            setEmployeeData(JSON.parse(storedEmployeeData));
        }
        if (storedCoffeeData) {
            setCoffeeData(JSON.parse(storedCoffeeData));
        }
        if (storedScannedEmployees) {
            setScannedEmployees(JSON.parse(storedScannedEmployees));
        }
    }, []);

    // Actualizar café cada minuto
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCoffeeData(prevState => {
                const newCoffeeData = { ...prevState };
                let updated = false;
                for (const barcode in newCoffeeData) {
                    const timestamp = newCoffeeData[barcode].timestamp;
                    if (timestamp && (now - new Date(timestamp)) > 12 * 60 * 60 * 1000) { // 12 horas en milisegundos
                        delete newCoffeeData[barcode];
                        updated = true;
                    }
                }
                if (updated) {
                    localStorage.setItem('coffeeData', JSON.stringify(newCoffeeData));
                }
                return newCoffeeData;
            });
            setScannedEmployees(prevState => {
                const newScannedEmployees = prevState.filter(emp => {
                    const record = coffeeData[emp.codigoBarras];
                    return record && (now - new Date(record.timestamp)) <= 12 * 60 * 60 * 1000;
                });
                if (newScannedEmployees.length !== prevState.length) {
                    localStorage.setItem('scannedCoffeeEmployees', JSON.stringify(newScannedEmployees));
                }
                return newScannedEmployees;
            });
        }, 60000); // Comprobar cada minuto
        return () => clearInterval(interval);
    }, [coffeeData]);

    useEffect(() => {
        if (barcodeRef.current) {
            barcodeRef.current.focus();
        }
    }, [barcode, scannedEmployees]);
    const handleBarcodeChange = (e) => {
        setBarcode(e.target.value);
    };

    const handleBarcodeScan = (barcode) => {
        const now = new Date();
        const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const employee = employeeData.find(emp => emp.codigoBarras === barcode);

        if (!employee) {
            alert('Empleado no encontrado');
            return;
        }

        setCoffeeData(prevState => {
            const currentEntry = prevState[barcode];
            let newCoffeeData;
            if (!currentEntry) {
                newCoffeeData = { ...prevState, [barcode]: { out: time, timestamp: now } };
            } else if (!currentEntry.in) {
                const outTime = new Date(`${now.toDateString()} ${currentEntry.out}`);
                const diff = Math.round((now - outTime) / 60000); // Diferencia en minutos
                newCoffeeData = { ...prevState, [barcode]: { ...currentEntry, in: time, time: `${diff} minutos`, timestamp: now } };
            } else {
                newCoffeeData = { ...prevState, [barcode]: { out: time, in: null, time: null, timestamp: now } };
            }
            localStorage.setItem('coffeeData', JSON.stringify(newCoffeeData));
            return newCoffeeData;
        });

        setScannedEmployees(prevState => {
            if (prevState.find(emp => emp.codigoBarras === barcode)) {
                return prevState;
            }
            const updatedScannedEmployees = [...prevState, employee];
            localStorage.setItem('scannedCoffeeEmployees', JSON.stringify(updatedScannedEmployees));
            return updatedScannedEmployees;
        });
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        doc.setFontSize(16);
        doc.text('Registros de Empleados - Tiempo tomado en el cafe', 20, 20);
        doc.setFontSize(12);
        doc.text(`Fecha de descarga: ${dateStr} Hora: ${timeStr}`, 20, 30);

        const headers = ["Nombre", "Hora de salida", "Hora de entrada", "Tiempo tomado"];
        const rows = scannedEmployees.map((employee) => {
            const coffeeRecord = coffeeData[employee.codigoBarras] || {};
            return [
                employee.nombres,
                coffeeRecord.out || 'No registra',
                coffeeRecord.in || 'No registra',
                coffeeRecord.time || 'No registra',
            ];
        });

        headers.forEach((header, index) => {
            doc.text(header, 20 + index * 40, 40);
        });

        rows.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                if (cell === 'No registra') {
                    doc.setTextColor(255, 0, 0); // Rojo
                } else {
                    doc.setTextColor(0, 0, 0); // Negro
                }
                doc.text(cell, 20 + cellIndex * 40, 50 + rowIndex * 10);
            });
        });

        doc.save('registros_empleados.pdf');
    };

    return (
        <TableContainer
            sx={{
                border: 'none',
                backgroundColor: 'info.main',
                borderRadius: '16px',
                padding: '0px 10px',
                boxSizing: 'border-box',
                width: '80%',
                margin: '0 auto',
            }}
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"

            >
                <TextField
                    label="Código de barras"
                    variant="outlined"
                    size='small'
                    color='secondary'
                    value={barcode}
                    onChange={handleBarcodeChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleBarcodeScan(barcode);
                            setBarcode('');
                        }
                    }}
                    sx={{ margin: '10px 0px' }}
                    inputRef={barcodeRef}
                />
                <IconButton onClick={handleDownloadPDF}>
                    <PictureAsPdfIcon sx={{ color: 'error.main' }} />
                </IconButton>

            </Box>
            <Table sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ textAlign: 'start', padding: '10px 0px', fontWeight: 'bold' }}>Nombre</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '10px 0px', fontWeight: 'bold' }}>Hora de salida</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '10px 0px', fontWeight: 'bold' }}>Hora de entrada</TableCell>
                        <TableCell sx={{ textAlign: 'end', padding: '10px 0px', fontWeight: 'bold' }}>Tiempo tomado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {scannedEmployees.map((employee, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row" sx={{ textAlign: 'start', padding: '10px 0px', fontWeight: 'bold' }}>
                                {employee.nombres.toUpperCase()}
                            </TableCell>
                            <TableCell sx={{ padding: '10px 0px', textAlign: 'center' }}>
                                {coffeeData[employee.codigoBarras]?.out ? (
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '10px',
                                            backgroundColor: 'green',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            padding: '3px 6px',
                                        }}
                                    >
                                        {coffeeData[employee.codigoBarras].out}
                                    </Box>
                                ) : 'No registra'}
                            </TableCell>
                            <TableCell sx={{ padding: '10px 0px', textAlign: 'center' }}>
                                {coffeeData[employee.codigoBarras]?.in ? (
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '10px',
                                            backgroundColor: 'green',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            padding: '3px 6px',
                                        }}
                                    >
                                        {coffeeData[employee.codigoBarras].in}
                                    </Box>
                                ) : 'No registra'}
                            </TableCell>
                            <TableCell sx={{ padding: '10px 0px', textAlign: 'end' }}>
                                {coffeeData[employee.codigoBarras]?.time ? coffeeData[employee.codigoBarras].time : 'No registra'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default Datos1;
