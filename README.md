
## OxyTrack BackEnd

# Requisitos previos
    Antes de comenzar, asegúrate de tener instalados los siguientes programas:
        · Node.js (v18 o superior)
        · npm (gestor de paquetes de Node.js)
        · MongoDB (base de datos NoSQL)

# Instalación de dependencias
    · Clona el repositorio en tu máquina local:
        git clone https://github.com/LuciaOcana/OxyTrack_BackEnd.git
        cd OxyTrack_BackEnd
    · Instala las dependencias necesarias:
        npm install

# Configuración del entorno
    · Copia el archivo de ejemplo de variables de entorno:
        cp .env.example .env
    · Edita el archivo .env con tus credenciales y configuraciones específicas, como la URI de conexión a MongoDB y las claves de autenticación.

# Compilación y ejecución
    · Compilación del código TypeScript
        tsc
    · Ejecución del servidor
        node dist/index.js

    **El servidor estará disponible en el puerto 3000

# Dependencias adicionales
    · Google APIs:
        npm install googleapis google-auth-library
    · Autenticación y tokens:
        npm install jsonwebtoken bcryptjs
        npm install --save-dev @types/jsonwebtoken
    · WebSockets:
        npm install ws
        npm install --save-dev @types/ws
