import { hostApi } from '@/environments/host'
import React, { use, useEffect, useState } from 'react'
import { set } from 'react-hook-form'

import { pdfjs } from 'react-pdf';
import { Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;



export default function VisualizarDocumentos({ matricula, dadosColeta, userData }: { matricula: string, dadosColeta: any, userData: any }) {

    if (!dadosColeta.imagens) return
    if (dadosColeta.imagens.length === 0) return

    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);

    const [open, setOpen] = React.useState(false)
    const [url, setUrl] = React.useState('')
    const [categoriaUrl, setCategoriaUrl] = useState('')

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    const carregarDocumento = async (id: string) => {
        // 192.168.1.10:4000/arquivo/:matricula/:id
        setUrl('')
        setNumPages(0)
        setPageNumber(1)
        const response = await fetch(`${hostApi}arquivo/${matricula}/${id}`, {
            method: "GET",
            headers: {
                'nomeCidade': `${userData.nomeCidade}`
            }
        })
        const data = await response.json()

        if (!response.ok) {
            alert('Erro ao carregar documento')
            return
        }

        const dataArquivo = data.message.imagens[0]
        setUrl(dataArquivo.url)
        setCategoriaUrl(dataArquivo.categoria)


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
                        <div className='bg-white p-2 rounded-md w-full max-w-md max-md:h-full h-5/6 flex flex-col justify-between'>

                            {
                                url && (

                                    <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>


                                        <div className='bg-white flex flex-col p-1 gap-1 max-md:w-full max-md:h-full rounded-md w-11/12 h-5/6'>

                                            <div className='h-8 bg-slate-200 text-center'>
                                                <h1>{categoriaUrl}</h1>
                                            </div>


                                            <div
                                                className='h-full overflow-auto'
                                            >

                                                {
                                                    url.split('.').pop() === 'pdf' ? (

                                                        <div
                                                            className='w-full h-full overflow-auto'
                                                        >

                                                            <Document file={url} onLoadSuccess={onDocumentLoadSuccess}

                                                            >
                                                                <Page pageNumber={pageNumber} />
                                                            </Document>
                                                        </div>
                                                    )

                                                        :
                                                        <img
                                                            src={url}
                                                            alt="Imagem do Documento"
                                                            className='w-full h-full object-contain'
                                                        />
                                                }

                                            </div>



                                            <button
                                                className='border border-gray-300 bg-red-500 text-white rounded-md p-2 w-full hover:bg-red-600 transition duration-300 ease-in-out'
                                                onClick={() => setUrl('')}
                                            >Fechar</button>
                                        </div>


                                    </div>
                                )
                            }
                            <h1 className='text-2xl font-bold text-gray-800'>Documentos</h1>
                            <p className='text-gray-500'>Matrícula: {matricula}</p>
                            <div className='flex flex-col items-center h-5/6 overflow-auto gap-1 py-4'>
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
