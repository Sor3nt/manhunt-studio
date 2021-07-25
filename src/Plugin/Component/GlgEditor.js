import AbstractComponent from "./Abstract.js";
import Studio from "../../Studio.js";
import Storage from "../../Storage.js";
import Event from "../../Event.js";

export default class GglEditor extends AbstractComponent{

    name = "glgeditor";
    displayName = "Config";

    /**
     * @param props {{}}
     */
    constructor(props) {
        super(props);
    }

    /**
     * @param entry {Result}
     */
    setEntry(entry){

        let record = Storage.findOneBy({
            type: Studio.GLG,
            gameId: entry.gameId,
            props: {
                model: entry.name
            }
        });

        if (record === null)
            return; //todo autoremove/hide component ?


        let result = [];


        result.push({
            label: '&nbsp;',
            value: record.file.split("#")[1]
        });

        result.push({
            label: 'Name',
            value: record.name
        });

        result.push({
            label: 'Class',
            value: record.props.getValue('CLASS')
        });

        let head = record.props.getValue('HEAD');
        if (head !== false)
            result.push({
                label: 'Head',
                value: jQuery('<span>').html(head).click(function () {

                    let headModel = Storage.findOneBy({
                        type: Studio.MODEL,
                        gameId: entry.gameId,
                        name: head
                    });

                    Event.dispatch(Event.OPEN_ENTRY, { entry: headModel });
                })
            });

        let physics = record.props.getValue('PHYSICS');
        if (physics !== false)
            result.push({
                label: 'Physics',
                value: physics
            });

        let container = jQuery('<ul>');
        result.forEach(function (info) {
            let li = jQuery('<li>');
            li.append(jQuery('<span>').append(info.label));
            li.append(jQuery('<div>').append(info.value));
            container.append(li);
        });

        this.element.html('').append(container);
    }

}