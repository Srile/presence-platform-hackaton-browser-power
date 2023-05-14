import {Component, Type} from '@wonderlandengine/api';
import { BotController } from './bot-controller';

export let robotPool;

export class RobotPool extends Component {
    static TypeName = 'robot-pool';
    static Properties = {};

    start() {
        robotPool = this;
        this.inactiveEntities = [];
        this.activeEntities = [];
        let children = this.object.children;
        for (let i = 0; i < children.length; i++) {
            this.inactiveEntities.push(children[i].getComponent(BotController));
            this.inactiveEntities[i].deactivate();
        }
    }

    getEntity() {
        if (this.inactiveEntities.length) {
            const entity = this.inactiveEntities.pop();
            this.activeEntities.push(entity);
            entity.activate();
            return entity;
        } else {
            console.error(
                'robot-pool: All pool entities are active. Please create more elements before this script runs.'
            );
            return null;
        }
    }

    returnEntity(entity) {
        let index = this.activeEntities.indexOf(entity);
        if (index !== -1 && !this.inactiveEntities.includes(entity)) {
            this.activeEntities.splice(index, 1);
            this.inactiveEntities.push(entity);
            entity.deactivate();
        } else {
            console.error(
                'robot-pool: You can not return an entity that is not part of the active pool.'
            );
        }
    }
}
