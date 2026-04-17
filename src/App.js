import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { db } from "./firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

const TYPES=["CPU","GPU","RAM","SSD","HDD","Motherboard","PSU","Case","Fan/Cooler","Cable","Monitor","KB/Mouse","WiFi Card","OS License","Other"];
const CONDS=["New","Used - Good","Used - Fair","Refurbished","For Parts"];
const STATUSES=["Building","Listed","For Sale","Reserved","Sold"];

const PARTS_DB=[
  {n:"AMD Ryzen 5 5600X",t:"CPU",s:"6C/12T · 3.7GHz · AM4",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"AMD Ryzen 5 5600G",t:"CPU",s:"6C/12T · 3.9GHz · Vega 7 · AM4",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"AMD Ryzen 7 5700X",t:"CPU",s:"8C/16T · 3.4GHz · AM4",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"AMD Ryzen 7 5700G",t:"CPU",s:"8C/16T · 3.8GHz · Vega 8 · AM4",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"AMD Ryzen 7 5800X",t:"CPU",s:"8C/16T · 3.8GHz · AM4",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"AMD Ryzen 9 5900X",t:"CPU",s:"12C/24T · 3.7GHz · AM4",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"AMD Ryzen 5 3600",t:"CPU",s:"6C/12T · 3.6GHz · AM4",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"AMD Ryzen 5 2600",t:"CPU",s:"6C/12T · 3.4GHz · AM4",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"AMD Ryzen 5 7600",t:"CPU",s:"6C/12T · 3.8GHz · AM5",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"AMD Ryzen 5 7600X",t:"CPU",s:"6C/12T · 4.7GHz · AM5",b:"AMD",img:"https://m.media-amazon.com/images/I/51MlCKS8gML._AC_SX75_.jpg"},
  {n:"Intel Core i3-10100",t:"CPU",s:"4C/8T · 3.6GHz · LGA1200",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i3-10100F",t:"CPU",s:"4C/8T · 3.6GHz · LGA1200 · No iGPU",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-10400",t:"CPU",s:"6C/12T · 2.9GHz · LGA1200",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-10400F",t:"CPU",s:"6C/12T · 2.9GHz · LGA1200 · No iGPU",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-10600K",t:"CPU",s:"6C/12T · 4.1GHz · LGA1200",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i7-10700",t:"CPU",s:"8C/16T · 2.9GHz · LGA1200",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i7-10700K",t:"CPU",s:"8C/16T · 3.8GHz · LGA1200",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-11400",t:"CPU",s:"6C/12T · 2.6GHz · LGA1200",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-11400F",t:"CPU",s:"6C/12T · 2.6GHz · LGA1200 · No iGPU",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-12400",t:"CPU",s:"6C/12T · 2.5GHz · LGA1700",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-12400F",t:"CPU",s:"6C/12T · 2.5GHz · LGA1700 · No iGPU",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-12600K",t:"CPU",s:"10C/16T · 3.7GHz · LGA1700",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i7-12700",t:"CPU",s:"12C/20T · 2.1GHz · LGA1700",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i7-12700K",t:"CPU",s:"12C/20T · 3.6GHz · LGA1700",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-13400F",t:"CPU",s:"10C/16T · 2.5GHz · LGA1700",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i5-13600K",t:"CPU",s:"14C/20T · 3.5GHz · LGA1700",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"Intel Core i7-13700K",t:"CPU",s:"16C/24T · 3.4GHz · LGA1700",b:"Intel",img:"https://m.media-amazon.com/images/I/51GRr6jMXnL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1050 Ti 4GB",t:"GPU",s:"4GB GDDR5 · 128-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1060 3GB",t:"GPU",s:"3GB GDDR5 · 192-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1060 6GB",t:"GPU",s:"6GB GDDR5 · 192-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1070 8GB",t:"GPU",s:"8GB GDDR5 · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1070 Ti 8GB",t:"GPU",s:"8GB GDDR5 · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1080 8GB",t:"GPU",s:"8GB GDDR5X · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1080 Ti 11GB",t:"GPU",s:"11GB GDDR5X · 352-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1650 4GB",t:"GPU",s:"4GB GDDR5 · 128-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1650 Super 4GB",t:"GPU",s:"4GB GDDR6 · 128-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1660 6GB",t:"GPU",s:"6GB GDDR5 · 192-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1660 Super 6GB",t:"GPU",s:"6GB GDDR6 · 192-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce GTX 1660 Ti 6GB",t:"GPU",s:"6GB GDDR6 · 192-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 2060 6GB",t:"GPU",s:"6GB GDDR6 · 192-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 2060 Super 8GB",t:"GPU",s:"8GB GDDR6 · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 2070 8GB",t:"GPU",s:"8GB GDDR6 · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 2070 Super 8GB",t:"GPU",s:"8GB GDDR6 · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 2080 Super 8GB",t:"GPU",s:"8GB GDDR6 · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 3050 8GB",t:"GPU",s:"8GB GDDR6 · 128-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 3060 12GB",t:"GPU",s:"12GB GDDR6 · 192-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 3060 Ti 8GB",t:"GPU",s:"8GB GDDR6 · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 3070 8GB",t:"GPU",s:"8GB GDDR6X · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 3070 Ti 8GB",t:"GPU",s:"8GB GDDR6X · 256-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 3080 10GB",t:"GPU",s:"10GB GDDR6X · 320-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 4060 8GB",t:"GPU",s:"8GB GDDR6 · 128-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 4060 Ti 8GB",t:"GPU",s:"8GB GDDR6 · 128-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"NVIDIA GeForce RTX 4070 12GB",t:"GPU",s:"12GB GDDR6X · 192-bit",b:"NVIDIA",img:"https://m.media-amazon.com/images/I/51mHjVZo1aL._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 570 4GB",t:"GPU",s:"4GB GDDR5 · 256-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 580 4GB",t:"GPU",s:"4GB GDDR5 · 256-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 580 8GB",t:"GPU",s:"8GB GDDR5 · 256-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 5500 XT 8GB",t:"GPU",s:"8GB GDDR6 · 128-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 5600 XT 6GB",t:"GPU",s:"6GB GDDR6 · 192-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 5700 XT 8GB",t:"GPU",s:"8GB GDDR6 · 256-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 6600 8GB",t:"GPU",s:"8GB GDDR6 · 128-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 6600 XT 8GB",t:"GPU",s:"8GB GDDR6 · 128-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 6700 XT 12GB",t:"GPU",s:"12GB GDDR6 · 192-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"AMD Radeon RX 7600 8GB",t:"GPU",s:"8GB GDDR6 · 128-bit",b:"AMD",img:"https://m.media-amazon.com/images/I/51DJrIoae-L._AC_SX75_.jpg"},
  {n:"Corsair Vengeance LPX 8GB DDR4-3200",t:"RAM",s:"1×8GB · CL16 · 3200MHz",b:"Corsair",img:"https://m.media-amazon.com/images/I/41D7M+KFI9L._AC_SX75_.jpg"},
  {n:"Corsair Vengeance LPX 16GB DDR4-3200",t:"RAM",s:"2×8GB · CL16 · 3200MHz",b:"Corsair",img:"https://m.media-amazon.com/images/I/41D7M+KFI9L._AC_SX75_.jpg"},
  {n:"Corsair Vengeance LPX 32GB DDR4-3200",t:"RAM",s:"2×16GB · CL16 · 3200MHz",b:"Corsair",img:"https://m.media-amazon.com/images/I/41D7M+KFI9L._AC_SX75_.jpg"},
  {n:"G.Skill Ripjaws V 16GB DDR4-3200",t:"RAM",s:"2×8GB · CL16 · 3200MHz",b:"G.Skill",img:"https://m.media-amazon.com/images/I/41stFnIKFIL._AC_SX75_.jpg"},
  {n:"G.Skill Ripjaws V 32GB DDR4-3600",t:"RAM",s:"2×16GB · CL18 · 3600MHz",b:"G.Skill",img:"https://m.media-amazon.com/images/I/41stFnIKFIL._AC_SX75_.jpg"},
  {n:"Kingston Fury Beast 8GB DDR4-3200",t:"RAM",s:"1×8GB · CL16 · 3200MHz",b:"Kingston",img:"https://m.media-amazon.com/images/I/41oXLyM5e3L._AC_SX75_.jpg"},
  {n:"Kingston Fury Beast 16GB DDR4-3200",t:"RAM",s:"2×8GB · CL16 · 3200MHz",b:"Kingston",img:"https://m.media-amazon.com/images/I/41oXLyM5e3L._AC_SX75_.jpg"},
  {n:"Corsair Vengeance 32GB DDR5-5600",t:"RAM",s:"2×16GB · CL36 · 5600MHz",b:"Corsair",img:"https://m.media-amazon.com/images/I/41D7M+KFI9L._AC_SX75_.jpg"},
  {n:"Generic DDR4 8GB 2400MHz",t:"RAM",s:"1×8GB · 2400MHz · Used pull",b:"Various",img:""},
  {n:"Generic DDR4 4GB 2400MHz",t:"RAM",s:"1×4GB · 2400MHz · Used pull",b:"Various",img:""},
  {n:"Generic DDR3 8GB 1600MHz",t:"RAM",s:"1×8GB · 1600MHz · Used pull",b:"Various",img:""},
  {n:"Generic DDR3 4GB 1600MHz",t:"RAM",s:"1×4GB · 1600MHz · Used pull",b:"Various",img:""},
  {n:"Samsung 870 EVO 250GB",t:"SSD",s:"SATA · 560MB/s · 2.5\"",b:"Samsung",img:"https://m.media-amazon.com/images/I/31MR7fW-KXL._AC_SX75_.jpg"},
  {n:"Samsung 870 EVO 500GB",t:"SSD",s:"SATA · 560MB/s · 2.5\"",b:"Samsung",img:"https://m.media-amazon.com/images/I/31MR7fW-KXL._AC_SX75_.jpg"},
  {n:"Samsung 870 EVO 1TB",t:"SSD",s:"SATA · 560MB/s · 2.5\"",b:"Samsung",img:"https://m.media-amazon.com/images/I/31MR7fW-KXL._AC_SX75_.jpg"},
  {n:"Samsung 970 EVO Plus 500GB",t:"SSD",s:"NVMe M.2 · 3500MB/s",b:"Samsung",img:"https://m.media-amazon.com/images/I/31BZVJbCGIL._AC_SX75_.jpg"},
  {n:"Samsung 970 EVO Plus 1TB",t:"SSD",s:"NVMe M.2 · 3500MB/s",b:"Samsung",img:"https://m.media-amazon.com/images/I/31BZVJbCGIL._AC_SX75_.jpg"},
  {n:"Samsung 980 PRO 500GB",t:"SSD",s:"NVMe M.2 · 6900MB/s",b:"Samsung",img:"https://m.media-amazon.com/images/I/31BZVJbCGIL._AC_SX75_.jpg"},
  {n:"Samsung 980 PRO 1TB",t:"SSD",s:"NVMe M.2 · 7000MB/s",b:"Samsung",img:"https://m.media-amazon.com/images/I/31BZVJbCGIL._AC_SX75_.jpg"},
  {n:"WD Blue SN570 500GB",t:"SSD",s:"NVMe M.2 · 3500MB/s",b:"WD",img:""},
  {n:"WD Blue SN570 1TB",t:"SSD",s:"NVMe M.2 · 3500MB/s",b:"WD",img:""},
  {n:"Kingston A400 240GB",t:"SSD",s:"SATA · 500MB/s · 2.5\"",b:"Kingston",img:""},
  {n:"Kingston A400 480GB",t:"SSD",s:"SATA · 500MB/s · 2.5\"",b:"Kingston",img:""},
  {n:"Crucial MX500 500GB",t:"SSD",s:"SATA · 560MB/s · 2.5\"",b:"Crucial",img:""},
  {n:"Crucial MX500 1TB",t:"SSD",s:"SATA · 560MB/s · 2.5\"",b:"Crucial",img:""},
  {n:"Crucial P3 500GB",t:"SSD",s:"NVMe M.2 · 3500MB/s",b:"Crucial",img:""},
  {n:"WD Blue 1TB 7200RPM",t:"HDD",s:"3.5\" · SATA · 64MB cache",b:"WD",img:""},
  {n:"WD Blue 500GB 7200RPM",t:"HDD",s:"3.5\" · SATA · 32MB cache",b:"WD",img:""},
  {n:"Seagate Barracuda 1TB 7200RPM",t:"HDD",s:"3.5\" · SATA · 64MB cache",b:"Seagate",img:""},
  {n:"Seagate Barracuda 2TB 7200RPM",t:"HDD",s:"3.5\" · SATA · 256MB cache",b:"Seagate",img:""},
  {n:"MSI B450M PRO-VDH MAX",t:"Motherboard",s:"mATX · AM4 · DDR4 · 2×M.2",b:"MSI",img:""},
  {n:"ASUS PRIME B450M-A II",t:"Motherboard",s:"mATX · AM4 · DDR4",b:"ASUS",img:""},
  {n:"ASUS PRIME B550M-A",t:"Motherboard",s:"mATX · AM4 · DDR4 · PCIe4",b:"ASUS",img:""},
  {n:"MSI B550M PRO-VDH WiFi",t:"Motherboard",s:"mATX · AM4 · DDR4 · WiFi",b:"MSI",img:""},
  {n:"Gigabyte B550M DS3H",t:"Motherboard",s:"mATX · AM4 · DDR4",b:"Gigabyte",img:""},
  {n:"ASUS PRIME B560M-A",t:"Motherboard",s:"mATX · LGA1200 · DDR4",b:"ASUS",img:""},
  {n:"MSI PRO B660M-A",t:"Motherboard",s:"mATX · LGA1700 · DDR4",b:"MSI",img:""},
  {n:"Gigabyte B660M DS3H",t:"Motherboard",s:"mATX · LGA1700 · DDR4",b:"Gigabyte",img:""},
  {n:"ASUS PRIME B660M-A",t:"Motherboard",s:"mATX · LGA1700 · DDR5",b:"ASUS",img:""},
  {n:"MSI PRO B760M-A WiFi",t:"Motherboard",s:"mATX · LGA1700 · DDR5 · WiFi",b:"MSI",img:""},
  {n:"Dell OptiPlex 3050 SFF Board",t:"Motherboard",s:"SFF · LGA1151 · DDR4",b:"Dell",img:""},
  {n:"Dell OptiPlex 7050 SFF Board",t:"Motherboard",s:"SFF · LGA1151 · DDR4",b:"Dell",img:""},
  {n:"HP ProDesk 400 G4 Board",t:"Motherboard",s:"SFF · LGA1151 · DDR4",b:"HP",img:""},
  {n:"Lenovo ThinkCentre M720 Board",t:"Motherboard",s:"SFF · LGA1151 · DDR4",b:"Lenovo",img:""},
  {n:"EVGA 500W 80+ White",t:"PSU",s:"500W · Non-Modular · ATX",b:"EVGA",img:""},
  {n:"EVGA 600W 80+ White",t:"PSU",s:"600W · Non-Modular · ATX",b:"EVGA",img:""},
  {n:"Corsair CV550 80+ Bronze",t:"PSU",s:"550W · Non-Modular · ATX",b:"Corsair",img:""},
  {n:"Corsair CX650M 80+ Bronze",t:"PSU",s:"650W · Semi-Modular · ATX",b:"Corsair",img:""},
  {n:"Corsair RM750x 80+ Gold",t:"PSU",s:"750W · Full-Modular · ATX",b:"Corsair",img:""},
  {n:"Seasonic Focus GX-650 80+ Gold",t:"PSU",s:"650W · Full-Modular · ATX",b:"Seasonic",img:""},
  {n:"Thermaltake Smart 500W 80+",t:"PSU",s:"500W · Non-Modular · ATX",b:"Thermaltake",img:""},
  {n:"Dell OEM 240W SFF PSU",t:"PSU",s:"240W · SFF · Proprietary",b:"Dell",img:""},
  {n:"HP OEM 180W SFF PSU",t:"PSU",s:"180W · SFF · Proprietary",b:"HP",img:""},
  {n:"Thermaltake Versa H18",t:"Case",s:"mATX · Mid Tower · Acrylic",b:"Thermaltake",img:""},
  {n:"NZXT H5 Flow",t:"Case",s:"ATX · Mid Tower · Mesh Front",b:"NZXT",img:""},
  {n:"Cooler Master Q300L",t:"Case",s:"mATX · Mini Tower · Mesh",b:"Cooler Master",img:""},
  {n:"Fractal Design Focus G",t:"Case",s:"ATX · Mid Tower · Acrylic",b:"Fractal",img:""},
  {n:"Corsair 4000D Airflow",t:"Case",s:"ATX · Mid Tower · Mesh",b:"Corsair",img:""},
  {n:"Phanteks P300A",t:"Case",s:"ATX · Mid Tower · Mesh",b:"Phanteks",img:""},
  {n:"Dell OptiPlex SFF Chassis",t:"Case",s:"SFF · Dell Proprietary",b:"Dell",img:""},
  {n:"HP ProDesk SFF Chassis",t:"Case",s:"SFF · HP Proprietary",b:"HP",img:""},
  {n:"Windows 11 Pro OEM Key",t:"OS License",s:"Digital License · 64-bit",b:"Microsoft",img:""},
  {n:"Windows 10 Pro OEM Key",t:"OS License",s:"Digital License · 64-bit",b:"Microsoft",img:""},
  {n:"Windows 10 Home OEM Key",t:"OS License",s:"Digital License · 64-bit",b:"Microsoft",img:""},
  {n:"TP-Link Archer T2E WiFi Card",t:"WiFi Card",s:"AC600 · PCIe · Dual Band",b:"TP-Link",img:""},
  {n:"TP-Link Archer TX3000E WiFi 6",t:"WiFi Card",s:"AX3000 · PCIe · BT 5.0",b:"TP-Link",img:""},
  {n:"Intel AX200 WiFi 6 M.2 Card",t:"WiFi Card",s:"AX200 · M.2 · BT 5.0",b:"Intel",img:""},
  {n:"ID-Cooling SE-214-XT",t:"Fan/Cooler",s:"Tower · 120mm · 150W TDP",b:"ID-Cooling",img:""},
  {n:"Cooler Master Hyper 212",t:"Fan/Cooler",s:"Tower · 120mm · 150W TDP",b:"Cooler Master",img:""},
  {n:"AMD Wraith Stealth Cooler",t:"Fan/Cooler",s:"Stock · 65W TDP · AM4",b:"AMD",img:""},
  {n:"Intel Stock Cooler LGA1700",t:"Fan/Cooler",s:"Stock · 65W TDP · LGA1700",b:"Intel",img:""},
  {n:"Arctic P12 120mm Fan",t:"Fan/Cooler",s:"120mm · PWM · 1800RPM",b:"Arctic",img:""},
];
const SI=PARTS_DB.map(p=>({...p,_q:`${p.n} ${p.t} ${p.b} ${p.s}`.toLowerCase()}));
const $=n=>n<0?`($${Math.abs(n).toFixed(2)})`:`$${n.toFixed(2)}`;
const uid=()=>`${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
const gk=p=>`${p.name}|${p.type}|${p.condition}`;

/* ════════════════════════════════════════════════════════
   SVG ICONS — replaces all emojis with clean monoline SVGs
   Matches Vercel's icon weight and sizing exactly
   ════════════════════════════════════════════════════════ */
const Icon=({d,size=16,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,display:"block"}}><path d={d}/></svg>;

const I={
  inventory:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  builds:"M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  dashboard:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
  plus:"M12 5v14m-7-7h14",
  search:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  chevDown:"M19 9l-7 7-7-7",
  chevRight:"M9 5l7 7-7 7",
  x:"M6 18L18 6M6 6l12 12",
  check:"M5 13l4 4L19 7",
  box:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  cpu:"M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 7h10v10H7z",
  gpu:"M2 8h20v10H2zM6 8V6m4 2V6m4 2V6m4 2V6",
  ram:"M4 6h16v12H4zM8 6v12m4-12v12m4-12v12",
  drive:"M22 12H2m20 0a2 2 0 01-2 2H4a2 2 0 01-2-2m20 0a2 2 0 00-2-2H4a2 2 0 00-2 2m18 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4m18-4V8a2 2 0 00-2-2H4a2 2 0 00-2 2v2",
  mobo:"M4 4h16v16H4zM9 4v16M4 9h16",
  psu:"M13 2L3 14h9l-1 8 10-12h-9l1-8",
  caseIc:"M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm8 5a3 3 0 100 6 3 3 0 000-6z",
  fan:"M12 12m-9 0a9 9 0 1018 0 9 9 0 00-18 0zm9-4a4 4 0 100 8 4 4 0 000-8z",
  cable:"M8 12h8m-8 0a4 4 0 110-8h8a4 4 0 010 8m-8 0a4 4 0 100 8h8a4 4 0 000-8",
  monitor:"M2 3h20v14H2zM8 21h8m-4-4v4",
  keyboard:"M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm4 10h8",
  wifi:"M12 20h0M8.5 16.5a5 5 0 017 0M5 13a10 10 0 0114 0M1.5 9.5a15 15 0 0121 0",
  key:"M15 7h2a5 5 0 010 10h-2m-6-2a2 2 0 100-4 2 2 0 000 4zM9 11h6",
  other:"M12 6v6m0 0v6m0-6h6m-6 0H6",
  note:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7",
};

const typeIconKey={CPU:"cpu",GPU:"gpu",RAM:"ram",SSD:"drive",HDD:"drive",Motherboard:"mobo",PSU:"psu",Case:"caseIc","Fan/Cooler":"fan",Cable:"cable",Monitor:"monitor","KB/Mouse":"keyboard","WiFi Card":"wifi","OS License":"key",Other:"other"};
const TIcon=({type,size=14})=><Icon d={I[typeIconKey[type]||"other"]} size={size} />;

/* ════════════════════════════════════════════════════════
   CSS — Vercel-exact: #0a0a0a bg, #fafafa text on buttons,
   rgba(255,255,255,.06) borders, Geist-like font stack
   ════════════════════════════════════════════════════════ */
const CSS=`
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0a;--sf:#111;--cd:#171717;--el:#1c1c1c;--hv:#222;
  --bd:rgba(255,255,255,.06);--bd2:rgba(255,255,255,.1);--bd3:rgba(255,255,255,.16);
  --ac:#0070f3;--acs:rgba(0,112,243,.08);--acm:rgba(0,112,243,.18);
  --gn:#0cce6b;--gs:rgba(12,206,107,.08);
  --rd:#e5484d;--rs:rgba(229,72,77,.08);
  --or:#f5a623;--os:rgba(245,166,35,.08);
  --bl:#0070f3;--bls:rgba(0,112,243,.08);
  --tx:#ededed;--t2:#999;--t3:#666;--t4:#333;
  --ff:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif;
  --r:8px;--rs:6px;--rl:12px;
}
body{font-family:var(--ff);background:var(--bg);color:var(--tx);-webkit-font-smoothing:antialiased;font-size:13px;line-height:1.5}
::selection{background:var(--acm);color:#fff}

.app{display:flex;height:100vh;overflow:hidden}

/* ─── Sidebar ─── */
.sb{width:200px;background:var(--bg);border-right:1px solid var(--bd);display:flex;flex-direction:column;flex-shrink:0}
.sb-brand{height:48px;display:flex;align-items:center;padding:0 16px;font-size:13px;font-weight:600;letter-spacing:-.01em;border-bottom:1px solid var(--bd);gap:8px}
.sb-brand svg{opacity:.5}
.sb-nav{flex:1;padding:8px;overflow-y:auto}
.sb-lbl{font-size:11px;font-weight:500;color:var(--t3);letter-spacing:.04em;text-transform:uppercase;padding:12px 8px 4px}
.sb-item{display:flex;align-items:center;gap:8px;width:100%;padding:0 8px;border:none;background:none;color:var(--t2);font:13px var(--ff);border-radius:var(--rs);cursor:pointer;transition:all .1s;text-align:left;height:32px}
.sb-item:hover{background:var(--cd);color:var(--tx)}
.sb-item.on{background:var(--cd);color:var(--tx)}
.sb-item svg{opacity:.6}
.sb-item.on svg{opacity:1}
.sb-item .ct{margin-left:auto;font-size:11px;color:var(--t3);font-variant-numeric:tabular-nums;min-width:16px;text-align:right}
.sb-ft{padding:12px 16px;border-top:1px solid var(--bd);display:flex;align-items:center;gap:6px;font-size:11px;color:var(--t2)}
.sb-ft .dot{width:6px;height:6px;border-radius:50%;background:var(--gn);flex-shrink:0}
.sb-ft .dot.err{background:var(--rd)}

/* ─── Main ─── */
.mn{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg)}
.hd{height:48px;display:flex;align-items:center;padding:0 24px;gap:12px;border-bottom:1px solid var(--bd);flex-shrink:0}
.hd-t{font-size:14px;font-weight:500}
.hd-s{font-size:12px;color:var(--t3)}
.ct-wrap{flex:1;overflow-y:auto}
.ct{padding:24px;max-width:960px}

/* ─── Buttons ─── */
.b{height:32px;padding:0 12px;border-radius:var(--rs);border:1px solid var(--bd2);background:var(--cd);color:var(--tx);font:500 12px var(--ff);cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .1s;white-space:nowrap}
.b:hover{border-color:var(--bd3);background:var(--el)}
.b1{background:#fafafa;color:#0a0a0a;border-color:transparent;font-weight:500}
.b1:hover{background:#e5e5e5}
.bx{color:var(--rd);border-color:rgba(229,72,77,.15)}
.bx:hover{background:var(--rs)}
.bs{height:26px;padding:0 8px;font-size:11px}
.bg{background:transparent;border-color:transparent}
.bg:hover{background:var(--cd)}

/* ─── Inputs ─── */
.inp{height:32px;padding:0 10px;border-radius:var(--rs);border:1px solid var(--bd);background:var(--bg);color:var(--tx);font:13px var(--ff);outline:none;width:100%;transition:border-color .15s}
.inp:focus{border-color:var(--bd3)}
.inp::placeholder{color:var(--t3)}
.inp-s{height:28px;font-size:12px;padding:0 8px}
select.inp{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='%23666'%3E%3Cpath d='M1 3l4 4 4-4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;padding-right:22px}

/* ─── Tags ─── */
.tg{display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:10px;font-size:11px;font-weight:500;white-space:nowrap}
.tg-g{background:var(--gs);color:var(--gn)}.tg-r{background:var(--rs);color:var(--rd)}.tg-o{background:var(--os);color:var(--or)}.tg-b{background:var(--bls);color:var(--bl)}.tg-d{background:rgba(255,255,255,.04);color:var(--t2)}

/* ─── Inventory rows ─── */
.lp{border:1px solid var(--bd);border-radius:var(--rl);overflow:hidden}
.lr{display:grid;grid-template-columns:36px 1fr 72px 80px 56px;align-items:center;padding:0 16px;height:48px;gap:8px;border-bottom:1px solid var(--bd);transition:background .06s}
.lr:last-child{border-bottom:none}
.lr:hover{background:rgba(255,255,255,.02)}
.lr:hover .la{opacity:1}
.lr-exp{grid-template-columns:36px 1fr 72px 80px 56px;padding-left:36px;height:40px;background:rgba(255,255,255,.01)}
.lc{display:flex;align-items:center;justify-content:center}
.lc input[type=checkbox]{width:14px;height:14px;accent-color:var(--ac);cursor:pointer;margin:0}
.lc button{border:none;background:none;color:var(--t3);cursor:pointer;padding:2px;display:flex;align-items:center;transition:color .1s}
.lc button:hover{color:var(--tx)}
.li{min-width:0}
.ln{font-size:13px;font-weight:500;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px}
.lm{font-size:11px;color:var(--t3);line-height:14px;display:flex;align-items:center;gap:6px;margin-top:1px}
.lp-pr{font-size:12px;font-weight:600;color:var(--gn);text-align:right;font-variant-numeric:tabular-nums}
.lp-pr small{display:block;font-size:10px;color:var(--t3);font-weight:500}
.lp-cd{display:flex;justify-content:center}
.la{display:flex;gap:2px;justify-content:flex-end;opacity:0;transition:opacity .1s}
.ab{width:28px;height:28px;border:none;background:transparent;color:var(--t3);cursor:pointer;border-radius:var(--rs);display:flex;align-items:center;justify-content:center;transition:all .08s}
.ab:hover{background:rgba(255,255,255,.06);color:var(--tx)}
.ab.dx:hover{color:var(--rd);background:var(--rs)}
.qty-badge{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:18px;border-radius:9px;background:var(--acs);color:var(--ac);font-size:10px;font-weight:600;padding:0 5px}

/* ─── Section headers ─── */
.grp{margin-bottom:20px}
.gh{display:flex;align-items:center;gap:8px;padding:0 0 8px}
.gh-t{font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
.gh-c{font-size:11px;color:var(--t3)}
.gh-l{flex:1;height:1px;background:var(--bd);margin-left:4px}

/* ─── Build cards ─── */
.bc{border:1px solid var(--bd);border-radius:var(--rl);margin-bottom:8px;overflow:hidden;transition:border-color .1s}
.bc.da{border-color:var(--ac);background:var(--acs)}
.bch{display:flex;align-items:center;gap:8px;padding:0 12px;height:44px;border-bottom:1px solid var(--bd)}
.bch input{flex:1;background:transparent;border:none;color:var(--tx);font:600 13px var(--ff);outline:none}
.bcb{padding:10px 12px;min-height:40px}
.bce{text-align:center;padding:14px;color:var(--t3);font-size:12px;border:1px dashed var(--bd2);border-radius:var(--rs)}
.bcp{display:flex;flex-wrap:wrap;gap:4px}
.pc{display:flex;align-items:center;gap:5px;height:26px;padding:0 8px;background:var(--cd);border:1px solid var(--bd);border-radius:var(--rs);font-size:11px;transition:border-color .08s}
.pc:hover{border-color:var(--bd2)}
.pc-n{font-weight:500}.pc-c{color:var(--gn);font-weight:600;font-variant-numeric:tabular-nums}
.pc-x{background:none;border:none;color:var(--t3);cursor:pointer;padding:0;display:flex;align-items:center;margin-left:2px;transition:color .08s}
.pc-x:hover{color:var(--rd)}
.bcf{display:flex;align-items:center;gap:16px;padding:0 12px;height:40px;border-top:1px solid var(--bd);background:rgba(255,255,255,.01)}
.bst label{display:block;font-size:10px;color:var(--t3);line-height:12px;letter-spacing:.02em}
.bst .v{font-size:12px;font-weight:600;line-height:16px;font-variant-numeric:tabular-nums}
.bst input{width:64px;height:22px;background:var(--bg);border:1px solid var(--bd);border-radius:4px;color:var(--tx);font:600 11px var(--ff);padding:0 4px;outline:none}

/* ─── KPI ─── */
.kg{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-bottom:24px}
.kp{padding:16px;border:1px solid var(--bd);border-radius:var(--rl)}
.kp-l{font-size:11px;color:var(--t3);letter-spacing:.03em;margin-bottom:4px}
.kp-v{font-size:20px;font-weight:600;line-height:1.2;font-variant-numeric:tabular-nums}

/* ─── Perf table ─── */
.ptbl{border:1px solid var(--bd);border-radius:var(--rl);overflow:hidden}
.ptbl-h{padding:12px 16px;border-bottom:1px solid var(--bd);font-size:13px;font-weight:500}
.pr{display:grid;grid-template-columns:1.4fr repeat(5,68px);align-items:center;padding:0 16px;height:44px;border-bottom:1px solid var(--bd)}
.pr:last-child{border-bottom:none}
.pr:nth-child(even){background:rgba(255,255,255,.015)}
.px{text-align:center}
.px-l{font-size:10px;color:var(--t3);line-height:12px}
.px-v{font-size:12px;font-weight:600;line-height:16px;font-variant-numeric:tabular-nums}

/* ─── Slide-over panel ─── */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;display:flex;justify-content:flex-end}
.pn{width:400px;max-width:100vw;background:var(--sf);border-left:1px solid var(--bd);height:100%;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;animation:si .16s ease}
@keyframes si{from{transform:translateX(100%)}to{transform:translateX(0)}}
.pn-t{font-size:14px;font-weight:600}
.fd label{display:block;font-size:11px;color:var(--t2);margin-bottom:4px;font-weight:500}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fr3{display:grid;grid-template-columns:1fr 1fr 64px;gap:8px}
.al{position:absolute;top:100%;left:0;right:0;z-index:10;background:var(--el);border:1px solid var(--bd2);border-radius:var(--r);max-height:280px;overflow-y:auto;margin-top:3px;box-shadow:0 6px 20px rgba(0,0,0,.35)}
.ai{display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background .05s;border-bottom:1px solid var(--bd)}
.ai:last-child{border-bottom:none}
.ai:hover,.ai.on{background:var(--acm)}
.ai-img{width:32px;height:32px;border-radius:var(--rs);background:var(--cd);object-fit:contain;flex-shrink:0}
.ai-fb{width:32px;height:32px;border-radius:var(--rs);background:var(--cd);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--t3)}
.ai-i{flex:1;min-width:0}
.ai-n{font-size:12px;font-weight:500;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ai-s{font-size:11px;color:var(--t2);line-height:14px}
.ck{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--t2);cursor:pointer}
.ck input{width:14px;height:14px;accent-color:var(--ac);margin:0;flex-shrink:0}
.wb{padding:6px 10px;border-radius:var(--rs);font-size:11px;background:var(--os);color:var(--or);border:1px solid rgba(245,166,35,.12)}
.fb{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.tb{display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap}

/* ─── Drag sidebar ─── */
.ds{width:200px;flex-shrink:0;position:sticky;top:0}
.ds-t{font-size:12px;font-weight:500;color:var(--t2);margin-bottom:8px}
.di{display:flex;align-items:center;gap:6px;padding:5px 6px;border-radius:var(--rs);cursor:grab;user-select:none;margin-bottom:1px;transition:background .08s;border:1px solid transparent;font-size:11px}
.di:hover{background:var(--cd)}
.di.dr{background:var(--acs);border-color:var(--ac)}
.di .nm{flex:1;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.di .pr{font-weight:600;color:var(--gn);flex-shrink:0;font-variant-numeric:tabular-nums}

@media(max-width:768px){.sb{display:none}.lr{grid-template-columns:28px 1fr 60px}.lr .lp-cd,.lr .la{display:none}}
`;

export default function App(){
  const[parts,setParts]=useState([]);
  const[builds,setBuilds]=useState([]);
  const[view,setView]=useState("inventory");
  const[dragItem,setDragItem]=useState(null);
  const[dragOver,setDragOver]=useState(null);
  const[loading,setLoading]=useState(true);
  const[syncErr,setSyncErr]=useState(false);
  const[panel,setPanel]=useState(null);
  const[form,setForm]=useState({name:"",type:"CPU",cost:"",condition:"Used - Good",source:"",notes:"",hasBox:false,purchaseDate:"",quantity:1});
  const[acR,setAcR]=useState([]);
  const[acI,setAcI]=useState(-1);
  const nRef=useRef(null);
  const dbRef=useRef(null);
  const[search,setSearch]=useState("");
  const[fType,setFType]=useState("All");
  const[fCond,setFCond]=useState("All");
  const[sort,setSort]=useState("name");
  const[sel,setSel]=useState(new Set());
  const[expanded,setExpanded]=useState(new Set());
  const sc=useRef({});

  useEffect(()=>{
    let u1,u2;
    try{
      u1=onSnapshot(collection(db,"parts"),s=>{setParts(s.docs.map(d=>({id:d.id,...d.data()})));setLoading(false);setSyncErr(false);},()=>{setSyncErr(true);setLoading(false);});
      u2=onSnapshot(collection(db,"builds"),s=>{setBuilds(s.docs.map(d=>({id:d.id,...d.data()})));},()=>setSyncErr(true));
    }catch{setSyncErr(true);setLoading(false);}
    return()=>{u1?.();u2?.();};
  },[]);

  const save=useCallback(async p=>setDoc(doc(db,"parts",p.id),p),[]);
  const del=useCallback(async pid=>{await deleteDoc(doc(db,"parts",pid));for(const b of builds){if(b.parts?.includes(pid))await setDoc(doc(db,"builds",b.id),{...b,parts:b.parts.filter(x=>x!==pid)});};},[builds]);
  const saveB=useCallback(async b=>setDoc(doc(db,"builds",b.id),b),[]);
  const delB=useCallback(async bid=>deleteDoc(doc(db,"builds",bid)),[]);

  const aIds=useMemo(()=>{const s=new Set();builds.forEach(b=>(b.parts||[]).forEach(i=>s.add(i)));return s;},[builds]);
  const avail=useMemo(()=>parts.filter(p=>!aIds.has(p.id)),[parts,aIds]);

  const proc=useMemo(()=>{
    let l=[...parts];
    if(search){const q=search.toLowerCase();l=l.filter(p=>p.name.toLowerCase().includes(q)||p.type.toLowerCase().includes(q)||(p.source||"").toLowerCase().includes(q));}
    if(fType!=="All")l=l.filter(p=>p.type===fType);
    if(fCond!=="All")l=l.filter(p=>p.condition===fCond);
    const sf={name:(a,b)=>a.name.localeCompare(b.name),cost_desc:(a,b)=>b.cost-a.cost,cost_asc:(a,b)=>a.cost-b.cost,type:(a,b)=>a.type.localeCompare(b.type),date:(a,b)=>(b.purchaseDate||"").localeCompare(a.purchaseDate||"")};
    l.sort(sf[sort]||sf.name);
    const groups={};l.forEach(p=>{if(!groups[p.type])groups[p.type]=[];groups[p.type].push(p);});
    const grouped={};
    Object.entries(groups).forEach(([t,items])=>{const map={};items.forEach(p=>{const k=gk(p);if(!map[k])map[k]={rep:p,items:[p]};else map[k].items.push(p);});grouped[t]=Object.values(map);});
    return{list:l,grouped,total:l.reduce((s,p)=>s+p.cost,0)};
  },[parts,search,fType,fCond,sort]);

  const gc=useCallback(b=>(b.parts||[]).reduce((s,pid)=>{const p=parts.find(x=>x.id===pid);return s+(p?p.cost:0);},0),[parts]);
  const gp=useCallback(b=>{const s=parseFloat(b.salePrice)||0;return s>0?s-gc(b):null;},[gc]);
  const st=useMemo(()=>{const sb=builds.filter(b=>b.status==="Sold");const r=sb.reduce((s,b)=>s+(parseFloat(b.salePrice)||0),0);const c=sb.reduce((s,b)=>s+gc(b),0);return{r,c,p:r-c,s:sb.length,i:parts.reduce((s,p)=>s+p.cost,0)};},[builds,parts,gc]);

  const hni=useCallback(v=>{setForm(f=>({...f,name:v}));setAcI(-1);clearTimeout(dbRef.current);if(v.length<2){setAcR([]);return;}dbRef.current=setTimeout(()=>{const q=v.toLowerCase();if(sc.current[q]){setAcR(sc.current[q]);return;}const tk=q.split(/\s+/).filter(Boolean);const r=SI.filter(p=>tk.every(t=>p._q.includes(t))).slice(0,10);sc.current[q]=r;setAcR(r);},100);},[]);
  const sac=useCallback(i=>{setForm(f=>({...f,name:i.n,type:i.t}));setAcR([]);setAcI(-1);},[]);
  const hak=useCallback(e=>{if(!acR.length)return;if(e.key==="ArrowDown"){e.preventDefault();setAcI(i=>Math.min(i+1,acR.length-1));}else if(e.key==="ArrowUp"){e.preventDefault();setAcI(i=>Math.max(i-1,-1));}else if(e.key==="Enter"&&acI>=0){e.preventDefault();sac(acR[acI]);}else if(e.key==="Escape")setAcR([]);},[acR,acI,sac]);

  const oa=()=>{setForm({name:"",type:"CPU",cost:"",condition:"Used - Good",source:"",notes:"",hasBox:false,purchaseDate:"",quantity:1});setAcR([]);setPanel("add");setTimeout(()=>nRef.current?.focus(),100);};
  const oe=p=>{setForm({name:p.name,type:p.type,cost:String(p.cost),condition:p.condition,source:p.source||"",notes:p.notes||"",hasBox:!!p.hasBox,purchaseDate:p.purchaseDate||"",quantity:1});setPanel({e:p.id});};
  const sf2=async()=>{if(!form.name||!form.cost)return;const b={name:form.name,type:form.type,cost:parseFloat(form.cost),condition:form.condition,source:form.source,notes:form.notes,hasBox:form.hasBox,purchaseDate:form.purchaseDate};if(panel==="add"){const q=Math.max(1,Math.min(form.quantity,50));for(let i=0;i<q;i++)await save({...b,id:uid()});}else if(panel?.e)await save({...b,id:panel.e});setPanel(null);setAcR([]);};
  const hd=async bid=>{if(!dragItem)return;const b=builds.find(x=>x.id===bid);if(b&&!b.parts?.includes(dragItem))await saveB({...b,parts:[...(b.parts||[]),dragItem]});setDragItem(null);setDragOver(null);};
  const ts=i=>setSel(p=>{const n=new Set(p);n.has(i)?n.delete(i):n.add(i);return n;});
  const bd=async()=>{for(const i of sel)await del(i);setSel(new Set());};
  const bs=async(f,v)=>{for(const i of sel){const p=parts.find(x=>x.id===i);if(p)await save({...p,[f]:v});}setSel(new Set());};
  const ct=c=>c==="New"?"tg-g":c==="Refurbished"?"tg-b":"tg-o";
  const te=k=>setExpanded(p=>{const n=new Set(p);n.has(k)?n.delete(k):n.add(k);return n;});

  if(loading)return(<><style>{CSS}</style><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--t2)",fontSize:13}}>Connecting...</div></>);

  const navItems=[["inventory",I.inventory,"Inventory",parts.length],["builds",I.builds,"Builds",builds.length],["dashboard",I.dashboard,"Dashboard",0]];

  return(<>
  <style>{CSS}</style>
  <div className="app">
    <aside className="sb">
      <div className="sb-brand"><Icon d={I.psu} size={16}/>PC Builder</div>
      <nav className="sb-nav">
        <div className="sb-lbl">Workspace</div>
        {navItems.map(([v,icon,label,count])=>(
          <button key={v} className={`sb-item${view===v?" on":""}`} onClick={()=>setView(v)}>
            <Icon d={icon} size={16}/>{label}{count>0&&<span className="ct">{count}</span>}
          </button>
        ))}
      </nav>
      <div className="sb-ft"><span className={`dot${syncErr?" err":""}`}/>{syncErr?"Offline":"Synced"}</div>
    </aside>

    <div className="mn">
      <header className="hd">
        <span className="hd-t">{view==="inventory"?"Inventory":view==="builds"?"Builds":"Dashboard"}</span>
        <span className="hd-s">{view==="inventory"&&parts.length>0?`${parts.length} parts · ${$(proc.total)}`:view==="builds"?`${builds.length} builds`:""}</span>
        <div style={{flex:1}}/>
        {view==="inventory"&&<button className="b b1" onClick={oa}><Icon d={I.plus} size={14}/>Add part</button>}
        {view==="builds"&&<button className="b b1" onClick={async()=>saveB({id:uid(),name:`Build #${builds.length+1}`,parts:[],salePrice:"",status:"Building"})}><Icon d={I.plus} size={14}/>New build</button>}
      </header>

      <div className="ct-wrap"><div className="ct">

      {/* ═══ INVENTORY ═══ */}
      {view==="inventory"&&(<>
        {sel.size>0&&<div className="tb"><span style={{fontSize:12,color:"var(--ac)"}}>{sel.size} selected</span><button className="b bs bx" onClick={bd}>Delete</button><button className="b bs" onClick={()=>bs("condition","New")}>Set New</button><button className="b bs" onClick={()=>bs("hasBox",true)}>Has Box</button><button className="b bs bg" onClick={()=>setSel(new Set())}>Clear</button></div>}
        <div className="fb">
          <div style={{position:"relative"}}><Icon d={I.search} size={14} color="var(--t3)"/><input className="inp inp-s" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:180,paddingLeft:28,position:"relative"}}/><div style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon d={I.search} size={14} color="var(--t3)"/></div></div>
          <select className="inp inp-s" value={fType} onChange={e=>setFType(e.target.value)} style={{width:120}}><option value="All">All types</option>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
          <select className="inp inp-s" value={fCond} onChange={e=>setFCond(e.target.value)} style={{width:130}}><option value="All">All conditions</option>{CONDS.map(c=><option key={c}>{c}</option>)}</select>
          <select className="inp inp-s" value={sort} onChange={e=>setSort(e.target.value)} style={{width:100}}><option value="name">Name</option><option value="cost_desc">Price ↓</option><option value="cost_asc">Price ↑</option><option value="type">Type</option><option value="date">Newest</option></select>
        </div>

        {Object.entries(proc.grouped).map(([type,groups])=>(
          <div key={type} className="grp">
            <div className="gh"><div className="gh-t"><TIcon type={type} size={14}/>{type}</div><span className="gh-c">{groups.reduce((s,g)=>s+g.items.length,0)}</span><div className="gh-l"/></div>
            <div className="lp">
              {groups.map(g=>{
                const k=gk(g.rep);const isExp=expanded.has(k);const qty=g.items.length;const isA=g.items.some(p=>aIds.has(p.id));
                return(<React.Fragment key={k}>
                  <div className="lr" style={{opacity:isA&&qty===1?.45:1}}>
                    <div className="lc">{qty>1?<button onClick={()=>te(k)}><Icon d={isExp?I.chevDown:I.chevRight} size={14}/></button>:<input type="checkbox" checked={sel.has(g.rep.id)} onChange={()=>ts(g.rep.id)}/>}</div>
                    <div className="li">
                      <div className="ln">{g.rep.name}{qty>1&&<span className="qty-badge">×{qty}</span>}{isA&&qty===1&&<span className="tg tg-b">in build</span>}</div>
                      <div className="lm">
                        {g.rep.source&&<span>{g.rep.source}</span>}
                        {g.rep.purchaseDate&&<span>{g.rep.purchaseDate}</span>}
                        {g.rep.hasBox&&<span style={{display:"flex",alignItems:"center"}}><Icon d={I.box} size={12} color="var(--or)"/></span>}
                        {g.rep.notes&&<span title={g.rep.notes} style={{display:"flex",alignItems:"center"}}><Icon d={I.note} size={12}/></span>}
                      </div>
                    </div>
                    <div className="lp-pr">{$(g.rep.cost)}{qty>1&&<small>{$(g.rep.cost*qty)}</small>}</div>
                    <div className="lp-cd"><span className={`tg ${ct(g.rep.condition)}`}>{g.rep.condition?.split(" - ")[0]}</span></div>
                    <div className="la"><button className="ab" onClick={()=>oe(g.rep)}><Icon d={I.edit} size={14}/></button><button className="ab dx" onClick={()=>del(g.rep.id)}><Icon d={I.trash} size={14}/></button></div>
                  </div>
                  {isExp&&qty>1&&g.items.map((p,i)=>(
                    <div key={p.id} className="lr lr-exp" style={{opacity:aIds.has(p.id)?.45:1}}>
                      <div className="lc"><input type="checkbox" checked={sel.has(p.id)} onChange={()=>ts(p.id)}/></div>
                      <div className="li"><div className="ln" style={{fontSize:12}}>Unit {i+1}{aIds.has(p.id)&&<span className="tg tg-b">in build</span>}</div></div>
                      <div className="lp-pr">{$(p.cost)}</div>
                      <div className="lp-cd"><span className={`tg ${ct(p.condition)}`} style={{height:18,fontSize:10}}>{p.condition?.split(" - ")[0]}</span></div>
                      <div className="la"><button className="ab" onClick={()=>oe(p)}><Icon d={I.edit} size={14}/></button><button className="ab dx" onClick={()=>del(p.id)}><Icon d={I.trash} size={14}/></button></div>
                    </div>
                  ))}
                </React.Fragment>);
              })}
            </div>
          </div>
        ))}
        {parts.length===0&&<div style={{textAlign:"center",padding:48,color:"var(--t3)"}}>No parts yet</div>}
      </>)}

      {/* ═══ BUILDS ═══ */}
      {view==="builds"&&(
        <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
          <div className="ds">
            <div className="ds-t">Available ({avail.length})</div>
            <div style={{maxHeight:"calc(100vh - 120px)",overflowY:"auto"}}>
              {avail.map(p=>(
                <div key={p.id} className={`di${dragItem===p.id?" dr":""}`} draggable onDragStart={()=>setDragItem(p.id)} onDragEnd={()=>{setDragItem(null);setDragOver(null);}}>
                  <TIcon type={p.type} size={13}/><span className="nm">{p.name}</span><span className="pr">{$(p.cost)}</span>
                </div>
              ))}
              {avail.length===0&&<div style={{fontSize:11,color:"var(--t3)",padding:8,textAlign:"center"}}>All assigned</div>}
            </div>
          </div>
          <div style={{flex:1}}>
            {builds.length===0&&<div style={{textAlign:"center",padding:48,color:"var(--t3)",border:"1px dashed var(--bd2)",borderRadius:"var(--rl)"}}>No builds yet</div>}
            {builds.map(b=>{const c=gc(b),p=gp(b),ov=dragOver===b.id;return(
              <div key={b.id} className={`bc${ov?" da":""}`} onDragOver={e=>{e.preventDefault();setDragOver(b.id);}} onDragLeave={()=>setDragOver(null)} onDrop={()=>hd(b.id)}>
                <div className="bch">
                  <input value={b.name} onChange={e=>saveB({...b,name:e.target.value})}/>
                  <select className="inp inp-s" value={b.status} onChange={e=>saveB({...b,status:e.target.value})} style={{width:90,background:b.status==="Sold"?"var(--gs)":"var(--bg)",color:b.status==="Sold"?"var(--gn)":"var(--tx)"}}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
                  <button className="ab dx" onClick={()=>delB(b.id)}><Icon d={I.x} size={14}/></button>
                </div>
                <div className="bcb">{(!b.parts||!b.parts.length)?<div className="bce">{ov?"Drop here":"Drag parts from sidebar"}</div>:(
                  <div className="bcp">{b.parts.map(pid=>{const pt=parts.find(x=>x.id===pid);if(!pt)return null;return(<div key={pid} className="pc"><TIcon type={pt.type} size={12}/><span className="pc-n">{pt.name}</span><span className="pc-c">{$(pt.cost)}</span><button className="pc-x" onClick={()=>saveB({...b,parts:b.parts.filter(x=>x!==pid)})}><Icon d={I.x} size={10}/></button></div>);})}</div>
                )}</div>
                <div className="bcf">
                  <div className="bst"><label>Cost</label><div className="v" style={{color:"var(--or)"}}>{$(c)}</div></div>
                  <div className="bst"><label>Sale</label><input type="number" value={b.salePrice} placeholder="0" onChange={e=>saveB({...b,salePrice:e.target.value})}/></div>
                  {p!==null&&<div className="bst"><label>Profit</label><div className="v" style={{color:p>=0?"var(--gn)":"var(--rd)"}}>{$(p)}</div></div>}
                  {p!==null&&c>0&&<div className="bst"><label>Margin</label><div className="v" style={{color:"var(--bl)"}}>{((p/(parseFloat(b.salePrice)||1))*100).toFixed(0)}%</div></div>}
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      {/* ═══ DASHBOARD ═══ */}
      {view==="dashboard"&&(<>
        <div className="kg">
          {[{l:"Revenue",v:$(st.r),c:"var(--gn)"},{l:"Costs",v:$(st.c),c:"var(--rd)"},{l:"Net profit",v:$(st.p),c:"var(--bl)"},{l:"Margin",v:st.r>0?`${((st.p/st.r)*100).toFixed(1)}%`:"—",c:"var(--ac)"},{l:"PCs sold",v:String(st.s),c:"var(--or)"},{l:"Inventory",v:$(st.i),c:"var(--t2)"}].map(k=>(
            <div key={k.l} className="kp"><div className="kp-l">{k.l}</div><div className="kp-v" style={{color:k.c}}>{k.v}</div></div>
          ))}
        </div>
        <div className="ptbl">
          <div className="ptbl-h">Build performance</div>
          {builds.map(b=>{const c=gc(b),p=gp(b),s=parseFloat(b.salePrice)||0;return(
            <div key={b.id} className="pr">
              <div><div style={{fontWeight:500}}>{b.name}</div><div style={{fontSize:11,color:"var(--t3)"}}>{(b.parts||[]).length} parts</div></div>
              {[{l:"Status",v:b.status,c:b.status==="Sold"?"var(--gn)":"var(--or)"},{l:"Cost",v:$(c),c:"var(--or)"},{l:"Sale",v:s>0?$(s):"—",c:"var(--tx)"},{l:"Profit",v:p!==null?$(p):"—",c:p!==null?(p>=0?"var(--gn)":"var(--rd)"):"var(--t3)"},{l:"Margin",v:p!==null&&s>0?`${((p/s)*100).toFixed(0)}%`:"—",c:"var(--bl)"}].map(x=>(<div key={x.l} className="px"><div className="px-l">{x.l}</div><div className="px-v" style={{color:x.c}}>{x.v}</div></div>))}
            </div>
          );})}
          {builds.length===0&&<div style={{padding:24,textAlign:"center",color:"var(--t3)",fontSize:12}}>No builds</div>}
        </div>
      </>)}

      </div></div>
    </div>
  </div>

  {/* ═══ SLIDE-OVER PANEL ═══ */}
  {panel&&(
    <div className="ov" onClick={()=>{setPanel(null);setAcR([]);}}>
      <div className="pn" onClick={e=>e.stopPropagation()}>
        <div className="pn-t">{panel==="add"?"Add parts":"Edit part"}</div>
        <div className="fd" style={{position:"relative"}}>
          <label>Part name</label>
          <input ref={nRef} className="inp" value={form.name} placeholder="Search (e.g. RTX 3060, Ryzen 5600...)" onChange={e=>hni(e.target.value)} onKeyDown={hak}/>
          {acR.length>0&&(<div className="al">{acR.map((i,x)=>(<div key={x} className={`ai${x===acI?" on":""}`} onClick={()=>sac(i)} onMouseEnter={()=>setAcI(x)}>
            {i.img?<img className="ai-img" src={i.img} alt="" onError={e=>{e.target.style.display="none";}}/>:<div className="ai-fb"><TIcon type={i.t} size={16}/></div>}
            <div className="ai-i"><div className="ai-n">{i.n}</div><div className="ai-s">{i.b} · {i.s}</div></div>
            <span className="tg tg-d">{i.t}</span>
          </div>))}</div>)}
        </div>
        <div className="fr">
          <div className="fd"><label>Type</label><select className="inp" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="fd"><label>Condition</label><select className="inp" value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})}>{CONDS.map(c=><option key={c}>{c}</option>)}</select></div>
        </div>
        <div className={panel==="add"?"fr3":"fr"}>
          <div className="fd"><label>Cost ($)</label><input className="inp" type="number" value={form.cost} placeholder="0.00" onChange={e=>setForm({...form,cost:e.target.value})}/></div>
          {panel==="add"&&<div className="fd"><label>Source</label><input className="inp" value={form.source} placeholder="eBay, FB..." onChange={e=>setForm({...form,source:e.target.value})}/></div>}
          {panel==="add"&&<div className="fd"><label>Qty</label><input className="inp" type="number" min="1" max="50" value={form.quantity} onChange={e=>setForm({...form,quantity:parseInt(e.target.value)||1})}/></div>}
        </div>
        {panel?.e&&<div className="fd"><label>Source</label><input className="inp" value={form.source} placeholder="eBay, FB..." onChange={e=>setForm({...form,source:e.target.value})}/></div>}
        <div className="fr">
          <div className="fd"><label>Purchase date</label><input className="inp" type="date" value={form.purchaseDate} onChange={e=>setForm({...form,purchaseDate:e.target.value})}/></div>
          <div className="fd"><label>Notes</label><input className="inp" value={form.notes} placeholder="Optional" onChange={e=>setForm({...form,notes:e.target.value})}/></div>
        </div>
        <label className="ck"><input type="checkbox" checked={form.hasBox} onChange={e=>setForm({...form,hasBox:e.target.checked})}/>Has original box</label>
        {panel==="add"&&form.name&&parts.some(p=>p.name.toLowerCase()===form.name.toLowerCase())&&<div className="wb">"{form.name}" exists — adds {form.quantity>1?`${form.quantity} more`:"another copy"}</div>}
        <div style={{display:"flex",gap:8,marginTop:"auto",paddingTop:4}}>
          <button className="b" style={{flex:1}} onClick={()=>{setPanel(null);setAcR([]);}}>Cancel</button>
          <button className="b b1" style={{flex:1,opacity:(!form.name||!form.cost)?.35:1}} onClick={sf2} disabled={!form.name||!form.cost}>{panel==="add"?(form.quantity>1?`Add ${form.quantity}`:"Add part"):"Save"}</button>
        </div>
      </div>
    </div>
  )}
  </>);
}
