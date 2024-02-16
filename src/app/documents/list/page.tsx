"use client"

import React, { useEffect } from 'react'

export default function List() {

    const [arquivos, setArquivos] = React.useState([])
    const [arquivoSelecionado, setArquivoSelecionado] = React.useState({} as any)
    const [src64, setSrc64] = React.useState('' as string)

    const listarArquivos = async () => {
        const response = await fetch('http://localhost:4000/arquivo')
        const data = await response.json()
        setArquivos(data.message)


    }


    const selecionarArquivo = async (id: string) => {
        if (id === arquivoSelecionado) {
            return
        }

        setArquivoSelecionado(id)
        const response = await fetch(`http://localhost:4000/arquivo/${id}`)
        const data = await response.json()
        const link64 = `data:${data.message.mimetype};base64,${data.message.base64}`
        setSrc64(link64)
    }

    useEffect(() => {
        listarArquivos()
    }, [])

    return (
        <div
            className='w-screen h-screen flex'
        >

            <div className='w-4/12 bg-gray-200 h-full flex flex-col items-center'
            >

                <div>
                    <h1>Listar arquivos</h1>
                </div>

                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Matrícula</th>
                                <th>Nome</th>
                            </tr>
                        </thead>
                        <tbody>
                            {arquivos.map((arquivo: any) => {
                                return (
                                    <tr key={arquivo._id}
                                        onClick={() => selecionarArquivo(arquivo._id)}
                                        className={arquivoSelecionado === arquivo._id ? 'bg-green-400' : 'cursor-pointer bg-slate-200'}
                                    >
                                        <td>{arquivo.matricula}</td>
                                        <td className='whitespace-nowrap '>{arquivo.nome}</td>

                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>


            <div className='w-8/12 h-full'>

                {src64 && <iframe
                    className='w-full h-screen'
                    title="PDF Viewer"
                    width="w-full"
                    height="h-screen"
                    src={src64}
                />}

            </div>

        </div>
    )
}
