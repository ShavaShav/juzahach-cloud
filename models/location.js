'use strict'

module.exports = (sequalize, DataType) => {
	const Location = sequelize.define('Location', {
		latitude: DataType.FLOAT,
		longitude: DataType.FLOAT
		timestamps: DataType.DATE
	}, {

		freezeTableName: true,
		tableName: 'Locations',
		timestamps: true
	});

	Location.associate = function(models){
		Location.belongsTo(models.Device, {as: 'device', foreignKey: 'deviceID'});
	};

	return Location;
};