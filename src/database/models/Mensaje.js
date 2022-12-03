module.exports = (sequelize, dataTypes) => {
    let alias = 'Mensaje';
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mensaje: {
            type: dataTypes.STRING
        },
        fechaMensaje: {
            type: dataTypes.DATE
        },
        emailEmisor: {
            type: dataTypes.STRING
        },
        emailReceptor: {
            type: dataTypes.STRING
        },
    };
    let config = {
        tableName: 'mensajes',
        timestamps: false
    };
    const Mensaje = sequelize.define(alias, cols, config)

    return Mensaje

}
