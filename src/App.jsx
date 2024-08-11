import { useState, useEffect } from 'react';
import { Box, Button, IconButton, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import Header from './components/Header';
import Main from './components/Main';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Footer from './components/Footer';

import Swal from 'sweetalert2'; // Importar SweetAlert2

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  overflowX: 'auto',
  maxHeight: '70vh'
};

function App() {
  const [open, setOpen] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [employeeData, setEmployeeData] = useState({ codigoBarras: '', nombres: '', area: '' });
  const [employeeList, setEmployeeList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Cargar datos desde localStorage cuando el componente se monte
  useEffect(() => {
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      setEmployeeList(JSON.parse(storedData));
    }
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenList = () => {
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      setEmployeeList(JSON.parse(storedData));
    }
    setOpenList(true);
  };

  const handleCloseList = () => setOpenList(false);

  const handleSave = () => {
    if (!employeeData.codigoBarras.trim() || !employeeData.nombres.trim() || !employeeData.area.trim()) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const existingData = JSON.parse(localStorage.getItem('employeeData')) || [];

    // Convertir codigoBarras a cadena de texto
    const newEmployeeData = { ...employeeData, codigoBarras: String(employeeData.codigoBarras) };

    if (editIndex !== null) {
      existingData[editIndex] = newEmployeeData;
    } else {
      existingData.push(newEmployeeData);
    }

    localStorage.setItem('employeeData', JSON.stringify(existingData));
    setEmployeeList(existingData);

    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Datos guardados exitosamente',
    });

    setEmployeeData({ codigoBarras: '', nombres: '', area: '' });
    setEditIndex(null);
    handleClose();
  };


  const handleEdit = (index) => {
    setEmployeeData(employeeList[index]);
    setEditIndex(index);
    handleOpen();
  };

  const handleDelete = (index) => {
    const updatedList = employeeList.filter((_, i) => i !== index);
    localStorage.setItem('employeeData', JSON.stringify(updatedList));
    setEmployeeList(updatedList);
  };

  // Subida masiva de empleados desde Excel
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      const newEmployees = json.map((row) => ({
        codigoBarras: String(row['Código de Barras'] || ''),
        nombres: row['Nombre Completo'] || '',
        area: row['Área'] || ''
      }));

      // Validar datos
      const existingData = JSON.parse(localStorage.getItem('employeeData')) || [];
      const existingCodigos = existingData.map(employee => employee.codigoBarras);

      const validEmployees = [];
      const duplicateEmployees = [];

      newEmployees.forEach(employee => {
        if (employee.codigoBarras && employee.nombres && employee.area) {
          if (existingCodigos.includes(employee.codigoBarras)) {
            duplicateEmployees.push(employee.codigoBarras);
          } else {
            validEmployees.push(employee);
          }
        }
      });

      if (duplicateEmployees.length > 0) {
        alert(`Los siguientes empleados ya están registrados: ${duplicateEmployees.join(', ')}`);
      }

      const updatedData = [...existingData, ...validEmployees];
      localStorage.setItem('employeeData', JSON.stringify(updatedData));
      setEmployeeList(updatedData);
      alert('Empleados subidos exitosamente');
    };
    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <Header handleOpen={handleOpen} handleOpenList={handleOpenList} />
      <Main />

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Datos del Empleado
          </Typography>
          <Box
            component="form"
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              required
              id="codigo-barras"
              label="Código de barras"
              variant="outlined"
              fullWidth
              type='text'
              value={employeeData.codigoBarras}
              onChange={(e) => setEmployeeData({ ...employeeData, codigoBarras: e.target.value })}
            />
            <TextField
              required
              id="nombres"
              label="Nombre completo"
              variant="outlined"
              fullWidth
              value={employeeData.nombres}
              onChange={(e) => setEmployeeData({ ...employeeData, nombres: e.target.value })}
            />
            <TextField
              required
              id="area"
              label="Área"
              variant="outlined"
              fullWidth
              value={employeeData.area}
              onChange={(e) => setEmployeeData({ ...employeeData, area: e.target.value })}
            />
            <Button
              type="button"
              variant="contained"
              color="secondary"
              onClick={handleSave}
            >
              {editIndex !== null ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
          <Box {...getRootProps()} sx={{ p: 2, border: '2px dashed #ccc', cursor: 'pointer', textAlign: 'center', my: 2 }}>
            <input {...getInputProps()} />
            <Typography>Arrastra y suelta un archivo Excel aquí, o haz clic para seleccionar uno.</Typography>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openList}
        onClose={handleCloseList}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Lista de Empleados
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Código de Barras</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nombre Completo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Área</TableCell>
                  <TableCell sx={{ textAlign: 'end' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeList.length > 0 ? (
                  employeeList.map((employee, index) => (
                    <TableRow key={index}>
                      <TableCell>{employee.codigoBarras}</TableCell>
                      <TableCell>{employee.nombres}</TableCell>
                      <TableCell>{employee.area}</TableCell>
                      <TableCell sx={{ textAlign: 'end' }}>
                        <IconButton
                          variant="contained"
                          color="secondary"
                          onClick={() => handleEdit(index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center' }}>No hay empleados registrados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

        </Box>

      </Modal>
      <Footer />
    </>
  );
}

export default App;
