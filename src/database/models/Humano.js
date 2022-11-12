module.exports = (sequelize, dataTypes) => {
    let alias = 'Humano';
    let cols = {
        idHumano: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: dataTypes.STRING
        },
        apellido: {
            type: dataTypes.STRING
        },
        telefono: {
            type: dataTypes.INTEGER
        },
        email: {
            type: dataTypes.STRING
        },
        password: {
            type: dataTypes.STRING
        },
        fotoPerfil: {
            type: dataTypes.STRING
        },
    };
    let config = {
        tableName: 'humanos',
        timestamps: false
    };
    const Humano = sequelize.define(alias, cols, config)

    return Humano

}
