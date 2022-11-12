module.exports = (sequelize, dataTypes) => {
    let alias = 'MascotaEncontrada';
    let cols = {
        idEncontrada: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idHumano: {
            type: dataTypes.STRING
        },
        descripcion: {
            type: dataTypes.INTEGER
        },
        pesoAproximado: {
            type: dataTypes.STRING
        },
        status: {
            type: dataTypes.STRING
        },
        fotoMascota: {
            type: dataTypes.STRING
        },
        colorPrimario: {
            type: dataTypes.STRING
        },
        colorSecundario: {
            type: dataTypes.STRING
        },
        tipoMascota: {
            type: dataTypes.STRING
        },     
        latEncontrada: {
            type: dataTypes.DECIMAL
        },
        lngEncontrada: {
            type: dataTypes.DECIMAL
        },
        
    };
    let config = {
        tableName: 'mascotasencontradas',
        timestamps: false
    };
    const MascotaEncontrada = sequelize.define(alias, cols, config)

    return MascotaEncontrada

}
