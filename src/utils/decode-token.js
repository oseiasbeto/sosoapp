import { jwtDecode } from "jwt-decode";

const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        return null;
    }
}

export default decodeToken