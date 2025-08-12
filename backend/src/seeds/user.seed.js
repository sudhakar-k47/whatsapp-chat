import { config } from 'dotenv';
config();
import {connectDB} from '../lib/db.js'; 
import User from '../models/user.model.js';


const seedUsers = [
    {
        fullName: "john",
        email: "43john123@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
        fullName: "jane",
        email: "jane@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
        fullName: "alex",
        email: "alex@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
        fullName: "emily",
        email: "emily@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
        fullName: "michael",
        email: "michael@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/3.jpg"
    },
    {
        fullName: "sarah",
        email: "sarah@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/3.jpg"
    },
    {
        fullName: "david",
        email: "david@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/4.jpg"
    },
    {
        fullName: "olivia",
        email: "olivia@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/4.jpg"
    },
    {
        fullName: "chris",
        email: "chris@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/5.jpg"
    },
    {
        fullName: "sophia",
        email: "sophia@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/5.jpg"
    },
    {
        fullName: "daniel",
        email: "daniel@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/6.jpg"
    },
    {
        fullName: "mia",
        email: "mia@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/6.jpg"
    },
    {
        fullName: "james",
        email: "james@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/7.jpg"
    },
    {
        fullName: "ava",
        email: "ava@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/7.jpg"
    },
    {
        fullName: "ben",
        email: "ben@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/8.jpg"
    },
    {
        fullName: "isabella",
        email: "isabella@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/8.jpg"
    },
    {
        fullName: "jack",
        email: "jack@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/9.jpg"
    },
    {
        fullName: "amelia",
        email: "amelia@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/9.jpg"
    },
    {
        fullName: "liam",
        email: "liam@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/men/10.jpg"
    },
    {
        fullName: "charlotte",
        email: "charlotte@example.com",
        password: "password123",
        profilePic: "https://randomuser.me/api/portraits/women/10.jpg"
    }
];


const seedDatabase = async () => {
    const db = await connectDB();
    await User.insertMany(seedUsers);
    console.log("Database seeded!");
};

seedDatabase();

export default seedUsers;
