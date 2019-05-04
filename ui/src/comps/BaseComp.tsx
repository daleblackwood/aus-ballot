import React from "react";
import { Subject, ISubjectListener } from "../model/Subject";

interface ISubjectBinding<T> {
    subject: Subject<T>;
    handler: (value: T) => void;
}

export class BaseComp<PROPS = {}, STATE = {}> extends React.Component<PROPS, STATE> {

    private bindings: Array<ISubjectBinding<any>> = [];

    public componentWillUnmount() {
        this.unlistenAll();
    }

    public listen<T>(subject: Subject<T>, handler: (value: T) => void) {
        this.unlisten(subject);
        subject.listen(handler);
        this.bindings.push({
            subject,
            handler
        });
    }

    public unlisten<T>(subject: Subject<T>) {
        for (let i=this.bindings.length-1; i>=0; i--) {
            const binding = this.bindings[i];
            if (binding.subject === subject) {
                subject.unlisten(binding.handler);
                this.bindings.slice(i, 1);
            }
        }
    }

    public unlistenAll() {
        for (const binding of this.bindings) {
            binding.subject.unlisten(binding.handler);
        }
        this.bindings = [];
    }

}
