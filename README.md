# Car Rental API

This is a **Node.js Express API** for a car rental system with **MongoDB**.

## Features
- User Registration & Login (`/register`, `/login`)
- JWT Authentication & Profile (`/my-profile`)
- Add & Retrieve Rental Cars (`/cars`, `/rental-cars`)
- Filter Cars by Year, Color, Steering Type, and Seats

---

## Setup

### Clone the Repository
```sh
git clone https://github.com/albansalihu1/car-rental-api.git
cd car-rental-api
```

### Install Dependencies
```sh
npm install
```

### Set Up Environment Variables
Create a `.env` file in the project root and add:
```sh
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3000
```

---

## Running the Application

### Start the Server
```sh
npm start
```
The API will run at: **`http://localhost:3000`**

---

## Testing the API

### **Register a User**
**Endpoint:** `POST /register`  
**Body:**
```json
{
    "full_name": "Alban Salihu",
    "email": "salihualban5@gmail.com",
    "username": "albansalihu",
    "password": "password"
}
```

### **Login a User**
**Endpoint:** `POST /login`  
**Body:**
```json
{
    "username": "albansalihu",
    "password": "password"
}
```
**Response:**
```json
{
    "message": "Login successful",
    "token": "your_jwt_token"
}
```

### **Get My Profile**
**Endpoint:** `GET /my-profile`  
**Headers:**
```sh
Authorization: Bearer your_jwt_token
```
**Response:**
```json
{
    "full_name": "Alban Salihu",
    "username": "albansalihu",
    "email": "salihualban5@gmail.com"
}
```

### **Add a Rental Car**
**Endpoint:** `POST /cars`  
**Body:**
```json
{
    "name": "Car Name",
    "price_per_day": 30,
    "year": 2020,
    "color": "White",
    "steering_type": "Automatic",
    "number_of_seats": 5
}
```

### **Get Rental Cars (Sorted by Price)**
**Endpoint:** `GET /rental-cars`  

### **Filter Rental Cars**
**Example:** Get red cars with automatic steering  
```sh
GET /rental-cars?color=Red&steering_type=Automatic
```
