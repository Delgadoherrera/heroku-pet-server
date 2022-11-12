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
        idEmisor: {
            type: dataTypes.INTEGER
        },
        idReceptor: {
            type: dataTypes.INTEGER
        },
    };
    let config = {
        tableName: 'mensajes',
        timestamps: false
    };
    const Mensaje = sequelize.define(alias, cols, config)

    return Mensaje

}
