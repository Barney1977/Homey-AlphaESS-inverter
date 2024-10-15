'use strict';

const Modbus = require('jsmodbus');
const net = require('net');
const DEFAULT_REGISTERS = require('./register.json');

const UNIT_ID = 85;
const PORT = 502;

class ModbusReader {

  port = null;
  host = null;

  socket = null;
  client = null;

  constructor(host, port = PORT) {
    this.host = host;
    this.port = port || PORT;
  }

  async readOnce(registers = DEFAULT_REGISTERS) {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const client = new Modbus.client.TCP(socket, UNIT_ID);

      socket.on('error', reject);

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      socket.on('connect', async () => {
        const result = {};

        for (const reg of registers) {
          // eslint-disable-next-line radix
          const res = await client.readHoldingRegisters(parseInt(reg.register), reg.len);
          let val = null;

          // eslint-disable-next-line default-case
          switch (reg.type) {
            case 'string':
              val = res.response.body.valuesAsBuffer.toString().replace(/\0/ig, '');
              break;

            case 'uint16be':
              val = res.response.body.valuesAsBuffer.readUint16BE();
              break;

            case 'int16be':
              val = res.response.body.valuesAsBuffer.readInt16BE();
              break;

            case 'uint32be':
              val = res.response.body.valuesAsBuffer.readUint32BE();
              break;

            case 'int32be':
              val = res.response.body.valuesAsBuffer.readInt32BE();
              break;

            default:
              reject(new Error('Unkonw type ' || reg.type));
          }

          result[reg.register] = {
            name: reg.name_en,
            unit: reg.unit,
          };

          if (reg.type === 'string') {
            result[reg.register].value = val;
          } else {
            // eslint-disable-next-line no-lonely-if
            if (reg.frontend_type === 'enum') {
              const enumVal = reg.enum.find((e) => e.value === val);
              result[reg.register].value = val;
              result[reg.register].value_name = enumVal ? enumVal.name_en : val;
            } else {
              result[reg.register].value = val * reg.factor ?? 1;
            }
          }

          // this.emit(`register_${reg.register}`, result[reg.register]);
        }

        resolve(result);
        socket.destroy();
      });

      const options = {
        host: this.host,
        port: this.port,
      };

      socket.connect(options);
    });
  }

}

module.exports = ModbusReader;
