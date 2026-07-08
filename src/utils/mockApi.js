// This file perfectly fakes a backend server by saving all data directly into 
// Chrome's Browser Storage (localStorage). This means you don't need ANY real backend
// running for your MVP demo!

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getInitialCars = () => [
  {
    id: 1,
    name: 'McLaren',
    description: 'This is the description of McLaren',
    color: 'Green',
    price: 25000,
    car_type: 'Sport',
    year: '2015',
    images: [{ url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800', id: 1 }]
  },
  {
    id: 2,
    name: 'Ferrari',
    description: 'Beautiful red Ferrari',
    color: 'Red',
    price: 45000,
    car_type: 'Sport',
    year: '2020',
    images: [{ url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', id: 2 }]
  },
  {
    id: 3,
    name: 'Porsche 911',
    description: 'Classic sports car',
    color: 'Silver',
    price: 35000,
    car_type: 'Sport',
    year: '2019',
    images: [{ url: '/porsche.jpg', id: 3 }]
  }
];

// Initialize DB in Chrome Local Storage
const initDB = () => {
  // FORCE WIPE old corrupted data to fix the images!
  const hasForceWiped = localStorage.getItem('force_wiped_cars_v6');
  if (!hasForceWiped) {
    localStorage.removeItem('db_cars');
    localStorage.setItem('force_wiped_cars_v6', 'true');
  }

  if (!localStorage.getItem('db_users')) localStorage.setItem('db_users', JSON.stringify([]));
  if (!localStorage.getItem('db_cars')) localStorage.setItem('db_cars', JSON.stringify(getInitialCars()));
  if (!localStorage.getItem('db_reservations')) localStorage.setItem('db_reservations', JSON.stringify([]));
};

initDB();

const getDB = (table) => JSON.parse(localStorage.getItem(`db_${table}`));
const setDB = (table, data) => localStorage.setItem(`db_${table}`, JSON.stringify(data));

const mockApi = {
  get: async (url, options) => {
    await delay(300); // Fake network delay
    
    // GET CARS
    if (url.includes('/api/v1/cars')) {
      const parts = url.split('/');
      const id = parseInt(parts[parts.length - 1]);
      
      const cars = getDB('cars');
      
      if (!isNaN(id) && !url.includes('filter')) {
        const car = cars.find(c => c.id === id);
        return { data: { data: { cars: car } } };
      }
      return { data: { data: { cars } } };
    }
    
    // GET RESERVATIONS
    if (url.includes('/api/v1/reservations')) {
      const reservations = getDB('reservations');
      const cars = getDB('cars');
      
      // The frontend expects the full car object attached to each reservation
      const populatedReservations = reservations.map(res => {
         const car = cars.find(c => c.id === parseInt(res.car_id));
         return {
           ...res,
           car: car || { price: 0, description: '', images: [], name: 'Unknown Car' }
         };
      });

      return { data: { data: { reservations: populatedReservations } } };
    }
    
    return Promise.reject({ response: { data: { error: 'Not found' } } });
  },

  post: async (url, bodyStr, options) => {
    await delay(300);
    let body = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr;

    // LOGIN
    if (url.includes('/login')) {
      const users = getDB('users');
      const user = users.find(u => u.username === body.username);
      if (user) {
        return { data: { token: `fake-token-for-${body.username}`, username: body.username } };
      }
      return Promise.reject({ response: { data: { error: 'User not found. Please register first.' } } });
    }

    // SIGNUP
    if (url.includes('/signup')) {
      const users = getDB('users');
      if (users.find(u => u.username === body.username)) {
        return Promise.reject({ response: { data: { error: 'Username already exists' } } });
      }
      users.push({ username: body.username });
      setDB('users', users);
      return { data: { message: 'User created successfully' } };
    }

    // ADD CAR
    if (url.includes('/api/v1/cars')) {
      const cars = getDB('cars');
      
      // Handle images array formatting (frontend expects array of objects with url and id)
      let formattedImages = [];
      if (Array.isArray(body.images)) {
        formattedImages = body.images.map((url, i) => ({ url: typeof url === 'string' ? url : url.url, id: i }));
      } else {
        formattedImages = [{ url: body.images || 'https://images.unsplash.com/photo-1503376710356-698650f598ea', id: 1 }];
      }

      const newCar = { 
        ...body, 
        id: Date.now(),
        images: formattedImages
      };
      cars.push(newCar);
      setDB('cars', cars);
      return { data: { data: newCar } };
    }

    // ADD RESERVATION
    if (url.includes('/api/v1/reservations')) {
      const reservations = getDB('reservations');
      const newRes = { ...body, id: Date.now() };
      reservations.push(newRes);
      setDB('reservations', reservations);
      return { data: { data: newRes } };
    }

    return Promise.reject({ response: { data: { error: 'Not found' } } });
  },

  delete: async (url, options) => {
    await delay(300);
    
    // DELETE CAR
    if (url.includes('/api/v1/cars')) {
      const parts = url.split('/');
      const id = parseInt(parts[parts.length - 1]);
      let cars = getDB('cars');
      cars = cars.filter(c => c.id !== id);
      setDB('cars', cars);
      return { data: { message: 'Deleted successfully' } };
    }

    // DELETE RESERVATION
    if (url.includes('/api/v1/reservations')) {
      const parts = url.split('/');
      const id = parseInt(parts[parts.length - 1]);
      let reservations = getDB('reservations');
      reservations = reservations.filter(r => r.id !== id);
      setDB('reservations', reservations);
      return { data: { message: 'Deleted successfully' } };
    }

    return Promise.reject({ response: { data: { error: 'Not found' } } });
  }
};

export default mockApi;
