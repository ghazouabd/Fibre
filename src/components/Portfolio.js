import React from 'react';
import { Link } from 'react-router-dom';

const Portfolio = () => {
    return (
        <div className="my-4 py-4 bg-gray-50 min-h-screen" id='dashboard'>
            <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold">Fiber Optic Monitoring Dashboard</h2>
            <div className='flex justify-center'>
                <div className='w-24 border-b-4 border-blue-900 mb-8'></div>
            </div>

            <div className="px-4" data-aos="fade-up" data-aos-delay="400">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="bg-white transition-all ease-in-out duration-400 overflow-hidden text-gray-700 hover:scale-105 rounded-lg shadow-xl p-4">
                        <h4 className="font-semibold text-xl text-center mb-4">Network Overview</h4>
                        <p className="text-sm leading-5 mb-4">
                            View real-time network performance including signal strength, latency, and error rates. Monitor fiber health across different segments.
                        </p>
                        <div className="flex justify-center">
                            <Link to="/network-overview" className="text-white bg-blue-900 hover:bg-blue-800 px-6 py-2 text-lg rounded-xl">
                                View Overview
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white transition-all ease-in-out duration-400 overflow-hidden text-gray-700 hover:scale-105 rounded-lg shadow-xl p-4">
                        <h4 className="font-semibold text-xl text-center mb-4">RTU Interface</h4>
                        <p className="text-sm leading-5 mb-4">
                            Manage and configure Remote Test Units (RTUs). Perform diagnostics, schedule tests, and review historical data logs for fiber links.
                        </p>
                        <div className="flex justify-center">
                            <Link to="/rtu-interface" className="text-white bg-blue-900 hover:bg-blue-800 px-6 py-2 text-lg rounded-xl">
                                Access RTU
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white transition-all ease-in-out duration-400 overflow-hidden text-gray-700 hover:scale-105 rounded-lg shadow-xl p-4">
                        <h4 className="font-semibold text-xl text-center mb-4">EMS Server</h4>
                        <p className="text-sm leading-5 mb-4">
                            Control and monitor network elements via the Element Management System (EMS). Analyze alarms, performance metrics, and service status.
                        </p>
                        <div className="flex justify-center">
                            <Link to="/user-management" className="text-white bg-blue-900 hover:bg-blue-800 px-6 py-2 text-lg rounded-xl">
                                Access EMS
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;