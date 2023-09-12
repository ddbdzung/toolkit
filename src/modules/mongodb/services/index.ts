import { MongodbModuleException } from '../mongodb.exception';
import { MongodbDriverVersion } from './mongodb.enum';
import MongodbServiceV3 from './mongodb-service-v3';
import MongodbServiceV4 from './mongodb-service-v4';
import MongodbServiceV5 from './mongodb-service-v5';
import MongodbServiceV6 from './mongodb-service-v6';

const instanceMap: Map<
  MongodbDriverVersion,
  MongodbServiceV3 | MongodbServiceV4 | MongodbServiceV5 | MongodbServiceV6
> = new Map();
instanceMap.set(MongodbDriverVersion.V3, MongodbServiceV3.getInstance());
instanceMap.set(MongodbDriverVersion.V4, MongodbServiceV4.getInstance());
instanceMap.set(MongodbDriverVersion.V5, MongodbServiceV5.getInstance());
instanceMap.set(MongodbDriverVersion.V6, MongodbServiceV6.getInstance());

export class MongodbServiceFactory {
  static getMongodbService<T>(version: number): T {
    if (!instanceMap.has(version)) {
      throw new MongodbModuleException(
        `MongodbServiceFactory: version=${version} not supported`,
      );
    }

    return instanceMap.get(version) as T;
  }
  private constructor() {}
}

export {
  MongodbServiceV3,
  MongodbServiceV4,
  MongodbServiceV5,
  MongodbServiceV6,
};
