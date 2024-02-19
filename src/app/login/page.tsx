"use client";


export default function Login() {

    const efetuarLogin = async (event: any) => {
        event.preventDefault();
        const email = event.target[0].value;
        const senha = event.target[1].value;

        if (!email || !senha) {
            alert('Preencha todos os campos');
            return;
        }

        const response = await fetch("https://api.wcogeo.com/validacao", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login: email, senha })
        })

        if (!response.ok) {
            alert('Credenciais incorretas');
            return;
        }

        const data = await response.json();
        console.log(data);

        localStorage.setItem('token', data.token);
        window.location.href = '/matricula';

    }

    return (
        <div className='flex flex-col items-center justify-center w-screen h-screen bg-gray-200 text-gray-700' >
            <h1 className="font-bold text-2xl">Coleta de Documentos</h1>
            <form className="flex flex-col bg-white rounded shadow-lg p-12 mt-12" onSubmit={efetuarLogin}>
                <label className="font-semibold text-xs" htmlFor="usernameField">Email</label>
                <input className="flex items-center h-12 px-4 w-64 bg-gray-200 mt-2 rounded focus:outline-none focus:ring-2" type="text" />
                <label className="font-semibold text-xs mt-3" htmlFor="passwordField">Senha</label>
                <input className="flex items-center h-12 px-4 w-64 bg-gray-200 mt-2 rounded focus:outline-none focus:ring-2" type="password" />
                <button className="flex items-center justify-center h-12 px-6 w-64 bg-blue-600 mt-8 rounded font-semibold text-sm text-blue-100 hover:bg-blue-700" type='submit'>Entrar</button>
            </form>
        </div>
    )
}
