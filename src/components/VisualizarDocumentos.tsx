import { hostApi } from '@/environments/host'
import React, { use, useEffect } from 'react'
import { set } from 'react-hook-form'

export default function VisualizarDocumentos({ matricula, dadosColeta }: { matricula: string, dadosColeta: any }) {

    if (!dadosColeta.imagens) return
    if (dadosColeta.imagens.length === 0) return

    const [open, setOpen] = React.useState(false)
    const [src64, setSrc64] = React.useState('')
    const [mimetype, setMimetype] = React.useState('')

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const carregarDocumento = async (id: string) => {
        // 192.168.1.10:4000/arquivo/:matricula/:id
        setSrc64('')
        const response = await fetch(`${hostApi}arquivo/${matricula}/${id}`)
        const data = await response.json()

        if (!response.ok) {
            alert('Erro ao carregar documento')
            return
        }

        const dataArquivo = data.message.imagens[0]

        const url64 = `data:${dataArquivo.mimetype};base64,${dataArquivo.base64}`
        setMimetype(dataArquivo.mimetype)
        setSrc64(url64)

    }

    useEffect(() => {
        if (!matricula) setOpen(false)
    }, [matricula])
    return (


        <>



            <button className="border border-gray-300 bg-gray-500 text-white rounded-md p-2 w-full hover:bg-gray-600 transition duration-300 ease-in-out" onClick={handleOpen}>Visualizar Documentos</button>



            {
                open && (

                    <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>
                        <div className='bg-white p-4 rounded-md w-full max-w-md'>

                            {
                                src64 && (

                                    <div
                                        className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'
                                    >


                                        <div className='bg-white p-4 rounded-md w-11/12 h-5/6'>

                                            {
                                                mimetype === 'application/pdf' && (
                                                    <iframe
                                                        src={src64}
                                                        width="100%"
                                                        height="94%"
                                                        allow="autoplay"
                                                        allowFullScreen
                                                        title="pdf"

                                                    />
                                                )
                                            }

                                            {
                                                mimetype !== 'application/pdf' && (
                                                    <img
                                                        src={src64}
                                                        alt="Imagem do Documento"
                                                        className='w-full h-full object-contain'
                                                    />
                                                )
                                            }
                                            <button
                                                className='border border-gray-300 bg-red-500 text-white rounded-md p-2 w-full hover:bg-red-600 transition duration-300 ease-in-out'
                                                onClick={() => setSrc64('')}
                                            >Fechar</button>
                                        </div>


                                    </div>
                                )
                            }
                            <h1 className='text-2xl font-bold text-gray-800'>Documentos</h1>
                            <p className='text-gray-500'>Matrícula: {matricula}</p>
                            <div className='flex flex-col justify-center items-center gap-1 py-2'>
                                {
                                    dadosColeta.imagens.map((item: any, index: any) => {
                                        return (

                                            <button
                                                key={index}
                                                className='border border-gray-300 bg-blue-500 text-white rounded-md p-2 w-full hover:bg-blue-600 transition duration-300 ease-in-out'
                                                onClick={() => carregarDocumento(item._id)}
                                            >Documento {index + 1} ({item.categoria})</button>
                                        )
                                    })
                                }
                            </div>
                            <button
                                className='border border-gray-300 bg-red-500 text-white rounded-md p-2 w-full hover:bg-red-600 transition duration-300 ease-in-out'
                                onClick={handleClose}
                            >Fechar</button>

                        </div>

                    </div>
                )
            }
        </>

    )
}
