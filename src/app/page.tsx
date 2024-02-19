"use client"

import { useEffect } from "react";

export default function Home() {

  const verificarLogado = async () => {
    const token = localStorage.getItem('token');

    if (token) {
      window.location.href = '/matricula';
      return
    }

    window.location.href = '/login';

  }

  useEffect(() => {
    verificarLogado();
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center h-screen gap-10"
    >

    </div>
  );
}
