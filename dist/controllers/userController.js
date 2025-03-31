"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.logIn = logIn;
const userServices_1 = require("../services/userServices");
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { birthDate } = _a, otherData = __rest(_a, ["birthDate"]); // Extraemos birthDate y el resto de datos
            // Función para calcular la edad a partir de la fecha de nacimiento
            const calculateAge = (birthDate) => {
                const birth = new Date(birthDate);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                // Si aún no ha pasado el cumpleaños de este año, restamos 1
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                return age;
            };
            const age = calculateAge(birthDate); // Calculamos la edad
            //console.log("La edad es "+ age);
            const userData = Object.assign(Object.assign({}, otherData), { birthDate, age }); // Asegurar que age está en el objeto
            // Crear usuario con la edad calculada
            const user = yield userServices_1.userServices.create(userData);
            res.status(201).json(user); // Devuelve el usuario creado
        }
        catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    });
}
function logIn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, password } = req.body;
            const loggedUser = yield userServices_1.userServices.findUserByUsername(username);
            console.log(loggedUser);
            /* if (!loggedUser) {
                 return res.status(404).json({ error: 'User not found' });
             }
     
             // Compare the provided password with the hashed password
             const passwordMatch = await bcrypt.compare(password, loggedUser.password);
             if (!passwordMatch) {
                 return res.status(400).json({ error: 'Incorrect password' });
             }
     
             if (!loggedUser.admin) {
                 return res.status(400).json({ error: 'You are not an Admin' });
             }
             if (loggedUser.disabled==true){
                 return res.status(300).json({ error: 'Usuario no habilitado' });
             }
     
             const token: string = jwt.sign(
                 { id: loggedUser.id, username: loggedUser.username, email: loggedUser.email, admin: loggedUser.admin },
                 process.env.SECRET || 'token'
             );*/
            res.json({ message: 'user logged in', /*token*/ });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get user' });
        }
    });
}
