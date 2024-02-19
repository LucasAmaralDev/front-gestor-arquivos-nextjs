"use client";


import { hostApi } from '@/environments/host';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Toaster, toast } from 'react-hot-toast';



export default function Arquivos() {

    const { register, handleSubmit, formState: { errors } } = useForm()

    const [src64, setSrc64] = React.useState('')



    const converterDocumento = async (event: any) => {

        toast.success('Arquivo enviado com sucesso!');
        const arquivo = event[0];
        const reader = new FileReader();

        const promise = new Promise((resolve, reject) => {
            reader.onload = (e: any) => {
                const base64Data = e.target.result.split(',')[1];
                const objetoArquivo = {
                    mimetype: arquivo.type,
                    base64: base64Data,
                    nome: arquivo.name,
                    filesize: arquivo.size,
                };

                const url64 = `data:${arquivo.type};base64,${base64Data}`;
                setSrc64(url64);

                resolve(objetoArquivo);
            };
        });
        // Adicione a seguinte linha para iniciar a leitura do conteúdo do arquivo
        reader.readAsDataURL(arquivo);

        return promise;
    };

    const onSubmit = async (data: any) => {
        const arquivoBase64 = await converterDocumento(data.arquivo) as Object;

        const dataInsert = {
            matricula: data.matricula,
            ...arquivoBase64
        }

        const response = await fetch(hostApi + 'arquivo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataInsert)
        })

        const dataJson = await response.json()

    };

    return (
        <div
            className='container mx-auto flex flex-col justify-center items-center h-screen w-full bg-gray-100'
        >
            <Toaster />
            <h1
                className='text-3xl font-bold text-gray-800'
            >Upload de Arquivos</h1>

            <form onSubmit={handleSubmit(onSubmit)}
                encType="multipart/form-data"
                className='flex flex-col justify-center items-center gap-4 w-full max-w-md p-4 bg-white shadow-md rounded-md'
            >
                <input type="text" {...register("matricula", { required: true })} className=' w-full p-2 border border-gray-300 rounded-md' placeholder='Matrícula' />
                {errors.matricula && <span className='text-red-500'>Campo Obrigatório</span>}

                <input type="file" {...register("arquivo", { required: true })} className='w-full p-2 border border-gray-300 rounded-md' />
                {errors.arquivo && <span className='text-red-500'>Campo Obrigatório</span>}
                <button type="submit"
                    className="border border-gray-300 bg-blue-500 text-white rounded-md p-2 w-full hover:bg-blue-600 transition duration-300 ease-in-out"
                >Enviar</button>

            </form>



            <a href="/documents/list"
                className='w-full max-w-md p-4 bg-white shadow-md rounded-md mt-4'
            >
                <button
                    className="border border-gray-300 bg-gray-500 text-white rounded-md p-2 w-full hover:bg-gray-600 transition duration-300 ease-in-out"
                >Listar Documentos Enviados</button>
            </a>

        </div>
    );
}
