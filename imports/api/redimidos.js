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

const jwt = require('jsonwebtoken');

export const Redimidos = new Mongo.Collection('redimidos');

import {
    Beneficios
} from './beneficios.js';
import {
    Usuarios
} from './usuarios.js';

if (Meteor.isServer) {

    Meteor.publish('redimidos', function redimidosPublication(token) {
        let usuario = decodificarToken(token);

        if (usuario) {
            if (usuario.rol === "uniandino") {
                return Redimidos.find({
                    $or: [{
                        idUsuario: usuario.identificacion
                    }, ],
                });
            } else {
                return Redimidos.find();
            }
        } else {
            throw new Meteor.Error("Debes haber iniciado sesión para acceder a esta funcionalidad.");
        }
    });
}

Meteor.methods({
    'redimidos.redimir'({
        idBeneficio,
        idUsuario
    }) {
        check(idBeneficio, String);
        check(idUsuario, String);

        const usuario = Usuarios.findOne({
            _id: idUsuario
        });

        if (usuario) {

            const beneficio = Beneficios.findOne({
                _id: idBeneficio
            });

            if (beneficio) {
                let puntosRestantes = usuario.puntos - beneficio.puntosRequeridos;
                if (puntosRestantes >= 0) {
                    Usuarios.update(idUsuario, {
                        $set: {
                            puntos: puntosRestantes
                        }
                    });

                    let fecha = new Date;

                    Redimidos.insert({
                        idUsuario: usuario.identificacion,
                        beneficio: beneficio.beneficio,
                        estado: "Notificado",
                        puntosRedimidos: beneficio.puntosRequeridos,
                        fechaRedimido: fecha.toLocaleString()
                    });

                    return true;
                } else {
                    throw new Meteor.Error("Los puntos disponibles son menores a los puntos requeridos.");
                }
            } else {
                throw new Meteor.Error("El beneficio a redimir no está disponible en este momento.")
            }
        } else {
            throw new Meteor.Error("No fue posible redimir el beneficio.")
        }
    }
});

function decodificarToken(token) {
    return token ? jwt.verify(token, 'shhhhhPTU') : null;
}