import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import NavBar from '../components/Navbar/NavBar';
import heroImg from '../images/fiber-optic-network.png'; // Replace with a fiber-related image

const Hero = () => {
    return (
        <>
            <div className="hero bg-gray-50 max-w-10xl mx-auto" id="hero">

                <div>
                    <NavBar />
                </div>

                <div className="m-auto overflow-hidden mx-4 mt-8 lg:mt-4 p-2 md:p-12 h-5/6" data-aos="zoom-in">
                    <div className="flex flex-col lg:flex-row py-8 justify-between text-center lg:text-left">
                        <div className="lg:w-1/2 flex flex-col justify-center" data-aos="zoom-in" data-aos-delay="200">
                            <h1 className="mb-5 md:text-5xl text-3xl font-bold text-blue-900">
                                Real-Time Fiber Optic Network Monitoring
                            </h1>
                            <div className="text-xl font-semibold tracking-tight mb-5 text-gray-600">
                                Proactively monitor your fiber optic network with advanced diagnostics, fault detection, and performance insights.
                            </div>
                            <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
                                
                               
                            </div>
                        </div>

                        <div className="flex lg:justify-end w-full lg:w-1/2" data-aos="fade-up" data-aos-delay="700">
                            <img
                                alt="Fiber Optic Network"
                                className="rounded-t float-right duration-800 w-3/3 lg:-ml-10"
                                src={heroImg}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;