import { IAspect, IConstruct, Stack, Tag } from "@aws-cdk/core";


/**
 * @see https://stackoverflow.com/questions/54990414/how-to-add-a-tag-to-an-aws-cdk-construct
 */
export default class TagAspect implements IAspect {
    private readonly tags: Object;

    constructor(tags: Object) {
        this.tags = tags;
    }

    public visit(node: IConstruct): void {
        if (node instanceof Stack) {
            Object.entries(this.tags).forEach( ([key, value]) => {
                Tag.add(node, key, value);
            });
        }
    }
}