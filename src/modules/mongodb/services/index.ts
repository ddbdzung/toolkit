import { IMongodbService } from '../interfaces/IMongodbService';
import { MongodbModuleException } from '../mongodb.exception';
import { MongodbDriverVersion } from './version.enum';
import MongodbServiceV3 from './v3';
import MongodbServiceV4 from './v4';
import MongodbServiceV5 from './v5';
import MongodbServiceV6 from './v6';

const instanceMap: Map<MongodbDriverVersion, IMongodbService> = new Map();
instanceMap.set(MongodbDriverVersion.V3, MongodbServiceV3.getInstance());
instanceMap.set(MongodbDriverVersion.V4, MongodbServiceV4.getInstance());
instanceMap.set(MongodbDriverVersion.V5, MongodbServiceV5.getInstance());
instanceMap.set(MongodbDriverVersion.V6, MongodbServiceV6.getInstance());

export default class MongodbServiceFactory {
  static getService(version: number) {
    if (!instanceMap.has(version)) {
      throw new MongodbModuleException(
        `MongodbServiceFactory: version=${version} not supported`,
      );
    }

    return instanceMap.get(version);
  }
  private constructor() {}
}
