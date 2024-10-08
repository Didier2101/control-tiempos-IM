import { useState, useEffect, useRef } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Box, IconButton, TextField } from '@mui/material';
import Swal from 'sweetalert2'; // Importar SweetAlert2


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
            Swal.fire({
                icon: 'error',
                title: 'Empleado no encontrado',
                text: 'No se encontró el empleado con el código de barras proporcionado.',
            });
            return;
        }


        setCoffeeData(prevState => {
            const currentEntry = prevState[barcode];
            let newCoffeeData;

            if (!currentEntry) {
                // Nuevo registro de salida
                newCoffeeData = { ...prevState, [barcode]: { out: time, timestamp: now } };
            } else if (!currentEntry.in) {
                // Registro de entrada
                const outTime = new Date(`${now.toDateString()} ${currentEntry.out}`);
                const diff = Math.round((now - outTime) / 60000); // Diferencia en minutos

                // Ajustar la diferencia en minutos si la entrada es al día siguiente
                const outDate = new Date(outTime);
                const inDate = new Date(now);
                let adjustedDiff = diff;

                if (inDate.getDate() !== outDate.getDate()) {
                    // Si la fecha de entrada es diferente, ajustar la diferencia
                    const daysDifference = inDate.getDate() - outDate.getDate();
                    const hoursInDay = 24;
                    const minutesInDay = hoursInDay * 60;
                    adjustedDiff = (daysDifference * minutesInDay) + diff;
                }

                newCoffeeData = { ...prevState, [barcode]: { ...currentEntry, in: time, time: `${adjustedDiff} minutos`, timestamp: now } };
            } else {
                // Verificar si han pasado más de 120 minutos desde la última salida
                const lastOutTime = new Date(currentEntry.timestamp);
                const minutesSinceLastOut = Math.round((now - lastOutTime) / 60000); // Diferencia en minutos

                if (minutesSinceLastOut > 240) {
                    // Permitir nueva salida
                    newCoffeeData = { ...prevState, [barcode]: { out: time, in: null, time: null, timestamp: now } };
                } else {
                    // No permitir nueva salida y mostrar mensaje/
                    Swal.fire({
                        icon: 'info',
                        title: 'Salida no permitida',
                        html: `El empleado <strong>${employee.nombres}</strong> ya ha salido. Debe esperar ${240 - minutesSinceLastOut} minutos para volver a salir, o informar a tu Supervisor`,
                    });
                    return prevState; // No hacer cambios si no han pasado 120 minutos
                }
            }

            // Actualizar en localStorage
            localStorage.setItem('coffeeData', JSON.stringify(newCoffeeData));
            return newCoffeeData;
        });

        setScannedEmployees(prevState => {
            // Insertar el nuevo empleado al principio del array
            const updatedScannedEmployees = [employee, ...prevState.filter(emp => emp.codigoBarras !== barcode)];
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
        doc.text('Registros de Empleados - Tiempo tomado en el café', 20, 20);
        doc.setFontSize(12);
        doc.text(`Fecha de descarga: ${dateStr} Hora: ${timeStr}`, 20, 30);

        const headers = ["Nombre", "Hora de salida", "Hora de entrada", "Tiempo tomado", "Área"];
        const rows = scannedEmployees.map((employee) => {
            const coffeeRecord = coffeeData[employee.codigoBarras] || {};
            return [
                employee.nombres.toLowerCase(),
                coffeeRecord.out ? coffeeRecord.out.toLowerCase() : 'no registra',
                coffeeRecord.in ? coffeeRecord.in.toLowerCase() : 'no registra',
                coffeeRecord.time ? coffeeRecord.time.toLowerCase() : 'no registra',
                employee.area.toLowerCase(),
            ];
        });

        doc.autoTable({
            startY: 40, // Ajusta el valor según la posición deseada para la tabla
            head: [headers],
            body: rows,
            styles: {
                fontSize: 10,
                cellPadding: 2,
                halign: 'left',
                valign: 'middle',
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'left' },
                2: { halign: 'left' },
                3: { halign: 'left' },
                4: { halign: 'left' },
            },
            didParseCell: (data) => {
                if (data.column.index === 3) { // Solo aplica la lógica para la columna "Tiempo tomado"
                    if (data.cell.text === 'no registra') {
                        data.cell.styles.fillColor = [255, 165, 0]; // Naranja
                    } else if (data.cell.text.includes('min')) {
                        // Ejemplo de cómo comprobar si el tiempo es mayor a 20 minutos
                        const timeInMinutes = parseFloat(data.cell.text.split(' ')[0]);
                        if (timeInMinutes > 20) {
                            data.cell.styles.fillColor = [255, 0, 0]; // Rojo
                        }
                    }
                }
            }
        });

        doc.save('registros_empleados.pdf');
    };



    return (
        <TableContainer
            sx={{
                border: 'none',
                backgroundColor: 'info.main',
                borderRadius: '6px',
                padding: '0px 10px',
                boxSizing: 'border-box',
                width: '98%',
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
                        <TableCell sx={{ textAlign: 'start', padding: '10px 0px', fontWeight: 'bold', fontSize: '1rem' }}>Nombre</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '10px 0px', fontWeight: 'bold', fontSize: '1rem' }}>
                            Area
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '10px 0px', fontWeight: 'bold', fontSize: '1rem' }}>Hora de salida</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '10px 0px', fontWeight: 'bold', fontSize: '1rem' }}>Hora de entrada</TableCell>
                        <TableCell sx={{ textAlign: 'end', padding: '10px 0px', fontWeight: 'bold', fontSize: '1rem' }}>Tiempo tomado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {scannedEmployees.map((employee, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row" sx={{ textAlign: 'start', padding: '10px 0px', fontSize: '0.7rem' }}>
                                {employee.nombres.toUpperCase()}
                            </TableCell>
                            <TableCell component="th" scope="row" sx={{ textAlign: 'center', padding: '10px 0px', fontSize: '0.7rem' }}>
                                {employee.area.toUpperCase()}
                            </TableCell>
                            <TableCell sx={{ padding: '10px 0px', textAlign: 'center', fontSize: '0.7rem' }}>
                                {coffeeData[employee.codigoBarras]?.out ? (
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '6px',
                                            backgroundColor: 'success.main',
                                            color: 'info.main',
                                            fontWeight: 'bold',
                                            fontSize: '0.7rem',
                                            textAlign: 'center',
                                            padding: '3px 8px',
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
                                            borderRadius: '6px',
                                            backgroundColor: 'warning.main',
                                            color: 'info.main',
                                            fontWeight: 'bold',
                                            fontSize: '0.7rem',
                                            textAlign: 'center',
                                            padding: '3px 8px',
                                        }}
                                    >
                                        {coffeeData[employee.codigoBarras].in}
                                    </Box>
                                ) : 'No registra'}
                            </TableCell>
                            <TableCell
                                sx={{
                                    padding: '10px 0px',
                                    textAlign: 'end',
                                    fontSize: '0.8rem',
                                    fontWeight: (coffeeData[employee.codigoBarras]?.time &&
                                        parseInt(coffeeData[employee.codigoBarras].time) > 20) ? 'bold' : '',
                                    color: (coffeeData[employee.codigoBarras]?.time &&
                                        parseInt(coffeeData[employee.codigoBarras].time) > 20) ? 'error.main' : 'success.main'
                                }}
                            >
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
