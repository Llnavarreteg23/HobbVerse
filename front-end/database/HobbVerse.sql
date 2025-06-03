-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 129.146.249.153:3311
-- Generation Time: May 23, 2025 at 05:45 PM
-- Server version: 11.7.2-MariaDB-ubu2404
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `HobbVerse`
--

-- --------------------------------------------------------

--
-- Table structure for table `Pedido`
--

CREATE TABLE `Pedido` (
  `id_pedido` int(11) NOT NULL,
  `fecha_pedido` date NOT NULL,
  `fecha_envio` date DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `total_pedido` decimal(10,2) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `Pedido`
--

INSERT INTO `Pedido` (`id_pedido`, `fecha_pedido`, `fecha_envio`, `estado`, `total_pedido`, `id_producto`, `id_usuario`) VALUES
(1, '2025-05-01', '2025-05-03', 'Enviado', 150.00, 1, 1),
(2, '2025-05-02', '2025-05-04', 'Enviado', 80.00, 2, 2),
(3, '2025-05-03', NULL, 'Pendiente', 120.00, 3, 3),
(4, '2025-05-04', '2025-05-06', 'Enviado', 200.00, 4, 4),
(5, '2025-05-05', NULL, 'Pendiente', 1200.00, 5, 5);

-- --------------------------------------------------------

--
-- Table structure for table `Productos`
--

CREATE TABLE `Productos` (
  `id_producto` int(11) NOT NULL,
  `nombre_producto` varchar(100) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `Productos`
--

INSERT INTO `Productos` (`id_producto`, `nombre_producto`, `cantidad`, `precio`, `categoria`, `descripcion`) VALUES
(1, 'Set de pinceles profesionales', 20, 150.00, 'Pintura', 'Pinceles de diferentes tamaños para pintura artística.'),
(2, 'Bufanda de crochet', 15, 80.00, 'Crochet', 'Tortuga.'),
(3, 'Libro de novelas clásicas', 50, 120.00, 'Lectura', 'Colección de novelas clásicas de literatura mundial.'),
(4, 'Pelota de fútbol oficial', 30, 200.00, 'Deportes', 'Pelota de fútbol tamaño reglamentario para partidos oficiales.'),
(5, 'Consola de videojuegos', 10, 1200.00, 'Videojuegos', 'Consola de última generación con control inalámbrico.');

-- --------------------------------------------------------

--
-- Table structure for table `Usuario`
--

CREATE TABLE `Usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contraseña` varchar(255) NOT NULL,
  `fecha_registro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `Usuario`
--

INSERT INTO `Usuario` (`id_usuario`, `nombre_completo`, `email`, `telefono`, `contraseña`, `fecha_registro`) VALUES
(1, 'Ana Gómez', 'ana.gomez@example.com', '3001234567', 'pass1234', '2024-01-15'),
(2, 'Luis Torres', 'luis.torres@example.com', '3019876543', 'pass5678', '2024-02-10'),
(3, 'Carla Pérez', 'carla.perez@example.com', '3023456789', 'passabcd', '2024-03-20'),
(4, 'Pedro Ríos', 'pedro.rios@example.com', '3034567890', 'passxyz', '2024-04-05'),
(5, 'Laura Díaz', 'laura.diaz@example.com', '3045678901', 'pass0987', '2024-05-01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Pedido`
--
ALTER TABLE `Pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indexes for table `Productos`
--
ALTER TABLE `Productos`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indexes for table `Usuario`
--
ALTER TABLE `Usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Pedido`
--
ALTER TABLE `Pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Productos`
--
ALTER TABLE `Productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Usuario`
--
ALTER TABLE `Usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Pedido`
--
ALTER TABLE `Pedido`
  ADD CONSTRAINT `Pedido_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `Productos` (`id_producto`),
  ADD CONSTRAINT `Pedido_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
