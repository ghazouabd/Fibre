import React from 'react';
import { Link } from 'react-router-dom';

const Portfolio = () => {
    return (
        <div className="my-4 py-4 bg-gray-50 py-[1rem]" id='dashboard'>
            <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold">Fiber Optic Network Monitoring</h2>
            <div className='flex justify-center'>
                <div className='w-24 border-b-4 border-blue-900 mb-8'></div>
            </div>

            <div className="px-4" data-aos="fade-up" data-aos-delay="400">
                <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-5">
                    {/* RTU Interface */}
                    <div className="bg-white w-1/2 mx-auto transition-all ease-in-out duration-400 overflow-hidden text-gray-700 hover:scale-105 rounded-lg shadow-xl p-2">

                        <h4 className="font-semibold text-xl text-center mb-4">RTU Management</h4>
                        <p className="text-sm leading-5 mb-4">
                            Configure and monitor Remote Test Units (RTUs) for real-time fiber optic network diagnostics and fault detection.
                        </p>
                        <div className="flex justify-center">
                            <Link to="/Onboard" className="text-white bg-blue-900 hover:bg-blue-800 px-6 py-2 text-lg rounded-xl">
                                Access RTU
                            </Link>
                        </div>
                    </div>

                    {/* EMS Server */}
                    
                </div>
            </div>
        </div>
    );
};

export default Portfolio;