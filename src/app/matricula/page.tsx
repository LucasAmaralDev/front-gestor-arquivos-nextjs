"use client"
import VisualizarDocumentos from '@/components/VisualizarDocumentos';
import VisualizarLogs from '@/components/VisualizarLogs';
import { hostApi } from '@/environments/host';
import { Autocomplete, TextField } from '@mui/material';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

const modeloDocumentos = {
    "cadastro-socio-economico": "Cadastro Sócio Econômico",
    "declaracao-de-vizinhaca": "Declaração de Vizinhança",
    "contratos": "Contratos",
    "certidao-nascimento": "Certidão de Nascimento",
    "certidao-casamento": "Certidão de Casamento",
    "contrato-uniao-estavel": "Contrato de União Estável",
    "certidao-obito": "Certidão de Óbito",
    "rg": "RG",
    "cpf": "CPF",
    "carteira-trabalho": "Carteira de Trabalho",
    "comprovante-residencia": "Comprovante de Residência",
    "outros": "Outros",
}

const statusDocumentos = {
    "cadastro-socio-economico": "Não Enviado",
    "declaracao-de-vizinhaca": "Não Enviado",
    "contratos": "Não Enviado",
    "certidao-nascimento": "Não Enviado",
    "certidao-casamento": "Não Enviado",
    "contrato-uniao-estavel": "Não Enviado",
    "certidao-obito": "Não Enviado",
    "rg": "Não Enviado",
    "cpf": "Não Enviado",
    "carteira-trabalho": "Não Enviado",
    "comprovante-residencia": "Não Enviado",
    "outros": "Não Enviado",
}



export default function page() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const [lote, setLote] = React.useState({} as any)
    const [labels, setLabels] = React.useState([] as any)
    const [categoria, setCategoria] = React.useState('' as any)
    const [statusDocumento, setStatusDocumento] = React.useState({} as any)
    const [dadosColeta, setDadosColeta] = React.useState({} as any)
    const [userData, setUserData] = React.useState({} as any)

    const getUserData = async () => {

        if (!localStorage.getItem('token')) {
            window.location.href = '/login'
            return
        }

        const response = await fetch("https://api.wcogeo.com/usuario/buscar-informacoes", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })

        const data = await response.json()

        if (!response.ok) {
            window.location.href = '/login'
            return
        }

        console.log("data", data)
        setUserData(data)
    }

    useEffect(() => {
        getUserData()
    }, [])

    const listarLotes = async () => {
        const response = await fetch("https://api.wcogeo.com/informacoes/txtcadastro", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'nomecidade': userData.nomeCidade,
                'nomebanco': userData.nomeBanco,
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })

        const data = await response.json()

        if (data.length === 0) {
            return
        }

        const labels = data.map((lote: any) => {
            return { label: lote.matricula, ...lote }
        })


        setLabels(labels)
    }

    const converterDocumento = async (event: any) => {
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
                resolve(objetoArquivo);
            };
        });
        // Adicione a seguinte linha para iniciar a leitura do conteúdo do arquivo
        reader.readAsDataURL(arquivo);

        return promise;
    };

    const listarDadosDaMatricula = async (matricula: string) => {

        setDadosColeta({})
        setStatusDocumento({})
        setCategoria('')
        reset()


        const response = await fetch(hostApi + "arquivo/info/" + matricula)
        const data = await response.json()

        if (data.message) {
            console.log("data.message", data.message)
            setDadosColeta(data.message)
        }

        const documentos = { ...statusDocumentos }


        if (!response.ok) {
            setStatusDocumento(documentos)
            return
        }


        if (!data.message.matricula) {
            console.log("nenhum documento encontrado")
            setStatusDocumento(documentos)
            return
        }


        data.message.imagens.forEach((documento: any) => {


            if ((documentos as any)[documento.categoria]) {

                (documentos as any)[documento.categoria] = "Enviado"

            }
        })

        setStatusDocumento(documentos)
    }

    const onSubmit = async (data: any) => {

        const toastId = toast.loading('Enviando arquivo...');
        const arquivoBase64 = await converterDocumento(data.arquivo) as any;

        if (arquivoBase64.mimetype !== "application/pdf" && arquivoBase64.mimetype !== "image/jpeg" && arquivoBase64.mimetype !== "image/png") {
            toast.error('Formato de arquivo inválido (Formatos aceitos são apenas pdf e imagens)!', { id: toastId });
            return
        }

        //se o arquivo for maior que 50mb
        if (arquivoBase64.filesize > 50000000) {
            toast.error('Tamanho do arquivo excede o limite de 50mb!', { id: toastId });
            return
        }

        const dataInsert = {
            ...lote,
            responsavel: userData.nome,
            status: "ATIVO",
            imagens:
            {
                categoria: categoria,
                ...arquivoBase64,
                responsavel: userData.nome,
                observacao: data.observacao
            },
            logs: {
                data: new Date(),
                responsavel: userData.nome,
                acao: `Enviou o documento ${categoria}`,
            }

        }

        const response = await fetch(hostApi + 'arquivo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataInsert)
        })

        const dataJson = await response.json()

        if (response.ok) {
            toast.success('Arquivo enviado com sucesso!', { id: toastId });
            reset()
            setCategoria('')
            listarDadosDaMatricula(lote.matricula)
        } else {
            toast.error('Erro ao enviar arquivo!', { id: toastId });
        }

        console.log("response", response)
        console.log("data", dataJson)
    };

    const iniciarColeta = async () => {

        const dataInsert = {
            ...lote,
            responsavel: userData.nome,
            status: "ATIVO",
            logs: {
                data: new Date(),
                responsavel: userData.nome,
                acao: `Iniciou a coleta`,
            }
        }

        const response = await fetch(hostApi + 'arquivo/alterarStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataInsert)
        })

        const data = await response.json()

        if (!response.ok) {
            toast.error('Erro ao iniciar coleta');
            return
        }

        toast.success('Coleta iniciada com sucesso!');
        setDadosColeta(data)

        listarDadosDaMatricula(lote.matricula)
    }

    const alterarColeta = async (novoStatus: string) => {

        const dataInsert = {
            ...lote,
            responsavel: userData.nome,
            status: novoStatus,
            logs: {
                data: new Date(),
                responsavel: userData.nome,
                acao: `Alterou o status para ${novoStatus}`,
            }
        }

        const response = await fetch(hostApi + 'arquivo/alterarStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataInsert)
        })

        const data = await response.json()

        if (!response.ok) {
            toast.error(`Erro ao alterar status para ${novoStatus}`);
            return
        }

        toast.success(`Status alterado para ${novoStatus}`);
        setDadosColeta(data)

        listarDadosDaMatricula(lote.matricula)
    }

    useEffect(() => {
        if (userData.nomeCidade) {
            listarLotes()
        }
    }, [userData])

    useEffect(() => {
        if (lote.matricula) {
            listarDadosDaMatricula(lote.matricula)
        }
    }, [lote])



    return (
        <div>
            <Toaster />

            {/* dados do usuario logado */}
            {
                !userData.nome ?

                    <div className='h-20 flex items-center justify-center'>
                        <p className='text-center'>Carregando dados do usuário</p>
                    </div>

                    :

                    <div className='flex flex-col items-center w-full'>
                        <div className='bg-gray-200 p-1 w-full'>
                            <h1 className='text-2xl font-bold text-center w-full'>Dados do Usuário</h1>
                        </div>

                        <div className='flex gap-4'>
                            <p className='font-bold'>Nome: {userData.nome}</p>
                            <p className='font-bold'>Cidade: {userData.nomeCidade}</p>
                            <p className='font-bold'>Banco: {userData.nomeBanco}</p>
                        </div>
                    </div>
            }


            <div>
                <div className='bg-gray-200 p-2'>
                    <h1 className='text-2xl font-bold text-center'>Matriculas</h1>
                </div>


                {labels.length > 0 ?

                    <div
                        className='p-4 w-full flex justify-center'
                    >
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={labels}
                            sx={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label="Matricula" />}
                            onChange={(event, value) => {
                                if (!value) {
                                    setLote({})
                                    return
                                }
                                console.log(value)
                                setLote(value)
                            }}
                            filterOptions={(options, params) => {

                                let encontrados = 0
                                const filtered = options.filter((option: any) => {

                                    if (encontrados > 20) {
                                        return false
                                    }

                                    if (option.label.toLowerCase().includes(params.inputValue.toLowerCase())) {
                                        encontrados++
                                        return true
                                    }
                                    return false;
                                });

                                return filtered;
                            }}
                            value={lote.label}
                        />
                    </div>


                    :

                    <div className='h-96 flex items-center justify-center'>
                        <p className='text-center'>Carregando</p>
                    </div>


                }
            </div>



            <div
                className='flex justify-center gap-4 my-4 flex-wrap'
            >
                {/* Dados do lote */}
                {lote.matricula &&
                    <div
                        className='w-full max-w-lg p-4 bg-white shadow-md rounded-md mt-4'
                    >
                        <div className='p-2'>
                            <div className='bg-gray-200 p-2'>
                                <h1 className='text-2xl font-bold'>Dados do Lote</h1>
                            </div>

                            <div className='p-2'>
                                <p className='font-bold'>matricula: {lote.matricula}</p>
                                <p className='font-bold'>bairro: {lote.bairro}</p>
                                <p className='font-bold'>quadra: {lote.quadra}</p>
                                <p className='font-bold'>lote: {lote.lote}</p>
                                <p className='font-bold'>numero: {lote.numero}</p>
                                <p className='font-bold'>proprietario: {lote.proprietario}</p>
                            </div>
                        </div>

                        <div className='bg-gray-200 p-2'>
                            <h1 className='text-2xl font-bold'>Status da Coleta: {dadosColeta.matricula}</h1>
                        </div>

                        <div className='p-2'>
                            <p className='font-bold'>Responsável: {dadosColeta.responsavel || "Nenhum usuário iniciou a coleta"}</p>
                            <p className='font-bold'>Status: {dadosColeta.status || "Em Aguardo"}</p>
                            <p className='font-bold'>Data: {new Date().toLocaleDateString()}</p>
                            {/* LOGS  */}
                            <VisualizarLogs logs={dadosColeta.logs} />
                            <VisualizarDocumentos matricula={lote.matricula} dadosColeta={dadosColeta} />
                        </div>

                        {
                            dadosColeta.status ?

                                <>
                                    {
                                        dadosColeta.status === "ATIVO" ?

                                            <div className='p-2 flex'>
                                                <button className='border border-gray-300 bg-blue-500 text-white rounded-md p-2 w-60 hover:bg-blue-600 transition duration-300 ease-in-out' onClick={() => alterarColeta("FINALIZADO")}>Finalizar Coleta</button>
                                                <button className='border border-gray-300 bg-yellow-500 text-white rounded-md p-2 w-60 hover:bg-yellow-600 transition duration-300 ease-in-out' onClick={() => alterarColeta("PAUSADO")}>Pausar Coleta</button>

                                            </div>

                                            :

                                            <div className='p-2'>
                                                <button onClick={() => alterarColeta("ATIVO")} className='border border-gray-300 bg-blue-500 text-white rounded-md p-2 w-60 hover:bg-blue-600 transition duration-300 ease-in-out'>Reiniciar Coleta</button>
                                            </div>

                                    }

                                </>

                                :

                                <div className='p-2'>
                                    <button onClick={iniciarColeta} className='border border-gray-300 bg-green-500 text-white rounded-md p-2 w-60 hover:bg-green-600 transition duration-300 ease-in-out'>Iniciar Coleta</button>
                                </div>


                        }






                    </div>
                }

                {/* Status dos Documentos */}
                {lote.matricula &&
                    <div
                        className='w-full max-w-lg p-4 bg-white shadow-md rounded-md mt-4'
                    >
                        <div className='bg-gray-200 p-2'>
                            <h1 className='text-2xl font-bold'>Status dos Documentos</h1>
                        </div>

                        <div className='p-2'>

                            {
                                statusDocumento &&

                                Object.keys(statusDocumento).map((key, index) => {
                                    const status = statusDocumento[key] // Enviado ou não enviado
                                    const modelo = (modeloDocumentos as any)[key] // Nome do documento

                                    return (
                                        <p key={index} className='font-bold' > {modelo}:
                                            <span className={status === "Enviado" ? "text-green-500" : "text-red-500"} >{status}</span>
                                        </p>)
                                })
                            }

                        </div>


                    </div>
                }

            </div>













            {
                ((dadosColeta.status === "ATIVO" && lote.matricula)) &&
                <div
                    className='w-full flex justify-center gap-4 my-4 flex-wrap'
                >

                    <div
                        className='flex flex-col justify-center items-center gap-4 w-full max-w-2xl p-4 bg-white shadow-md rounded-md'
                    >

                        <div className='bg-gray-200 p-2 w-full'>
                            <h1 className='text-2xl font-bold'>Selecione a categoria de documento</h1>

                            <select className='w-full p-2 border border-gray-300 rounded-md' onChange={(e) => setCategoria(e.target.value)} value={categoria}>
                                <option value="">Selecione uma categoria</option>

                                {
                                    Object.keys(modeloDocumentos).map((key, index) => {
                                        const modelo = key // Nome do documento salvo no banco de dados ; Ex: cadastro-socio-economico
                                        const descricao = (modeloDocumentos as any)[key] // Nome do documento a ser exibido ; Ex: Cadastro Sócio Econômico

                                        return <option key={index} value={key}>{descricao}</option>
                                    })
                                }

                            </select>
                        </div>

                        {
                            categoria &&

                            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className='flex flex-col justify-center items-center gap-4 w-full max-w-md p-4 bg-white shadow-md rounded-md'>
                                <input type="file" {...register("arquivo", { required: true })} className='w-full p-2 border border-gray-300 rounded-md' />

                                {errors.arquivo && <span className='text-red-500'>Campo Obrigatório</span>}

                                <input type="text" {...register("observacao")} className='w-full p-2 border border-gray-300 rounded-md' placeholder='Observação' />

                                <button type="submit" className="border border-gray-300 bg-blue-500 text-white rounded-md p-2 w-full hover:bg-blue-600 transition duration-300 ease-in-out">Enviar</button>
                            </form>
                        }

                    </div>
                </div>
            }




        </div>
    )
}
