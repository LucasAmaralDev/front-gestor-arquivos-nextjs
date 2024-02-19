import React from 'react'

export default function VisualizarLogs({ logs }: { logs: any[] }) {

    if (!logs) return
    if (logs.length === 0) return

    const [open, setOpen] = React.useState(false)

    return (
        <div>
            <button onClick={() => setOpen(true)} className="border border-gray-300 bg-gray-500 text-white rounded-md p-2 w-full hover:bg-gray-600 transition duration-300 ease-in-out">Visualizar Logs</button>



            <div className={open ? 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50' : 'hidden'}>
                <div className='bg-white p-4 rounded-md w-full max-w-3xl'>
                    <div className='flex justify-between items-center'>
                        <h1 className='text-3xl font-bold text-gray-800'>Logs</h1>
                        <button onClick={() => setOpen(false)} className="border border-gray-300 bg-red-500 text-white rounded-md p-2 w-24 hover:bg-red-600 transition duration-300 ease-in-out">Fechar</button>
                    </div>

                    <div className='flex flex-col'>
                        {
                            logs.map((log, index) => (
                                <div key={index} className='flex justify-between items-center'>
                                    <p
                                        className='text-gray-800 text-sm mt-2'
                                    >Usuário <span className='font-bold'>{log.responsavel}</span> - ação: <span className='font-bold'>{log.acao}</span> - data: <span className='font-bold'> {new Date(log.data).toLocaleDateString()}</span></p>
                                </div>
                            ))
                        }
                    </div>
                </div>

            </div>

        </div>
    )
}
