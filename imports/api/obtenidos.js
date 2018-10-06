import {
    Meteor
} from 'meteor/meteor';
import {
    Mongo
} from 'meteor/mongo';
import {
    check
} from 'meteor/check';
import {
    Match
} from 'meteor/check';

export const Obtenidos = new Mongo.Collection('obtenidos');

if (Meteor.isServer) {

    Meteor.publish('obtenidos', function obtenidosPublication(token) {
        let usuario = decodificarToken(token);

        if (usuario) {
            if (usuario.rol === "adminPTU") {
                return Obtenidos.find();
            } else {
                return Obtenidos.find({
                    $or: [{
                        idUsuario: usuario.identificacion
                    }, ],
                });
            }
        } else {
            throw new Meteor.Error("Debes haber iniciado sesión para acceder a esta funcionalidad.");
        }
    });
}



function decodificarToken(token) {
    return token ? jwt.verify(token, 'shhhhhPTU') : null;
}