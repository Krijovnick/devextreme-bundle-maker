import {
  Ref,
  Effect,
  Component,
  ComponentBindings,
  JSXComponent,
  OneWay,
  InternalState,
} from 'devextreme-generator/component_declaration/common';
import eventsEngine from '../../../events/core/events_engine';

const getVirtualRowStyles = (item: any): { [key: string]: string | number } => ({
  height: item.height ? `${item.height}px` : '',
});

function viewFunction({
  widgetRef, styles, rows, props: { columns }, restAttributes,
}: DataGridLight) {
  return (
    <div
      {...restAttributes} // eslint-disable-line react/jsx-props-no-spreading
      className="my-grid"
      ref={widgetRef as any}
      style={styles}
    >
      <table>
        <thead>
        <tr>
          {columns?.map((column, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <th key={index}>
              {column}
            </th>
          ))}
        </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id} style={getVirtualRowStyles(item)}>
              {columns?.map((column, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <td key={index}>
                  {item[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

@ComponentBindings()
class DataGridLightProps {
  @OneWay()
  keyExpr = 'id';

  @OneWay()
  columns?: string[] = [];

  @OneWay()
  dataSource?: any;

  @OneWay()
  height = 800;
}

@Component({
  view: viewFunction,
})
export class DataGridLight extends JSXComponent(DataGridLightProps) {
  @Ref() widgetRef!: HTMLDivElement;

  @InternalState() topRowIndex = 0;

  @InternalState() rowHeight = 34;

  get styles(): { [key: string]: string | number } {
    return {
      height: this.props.height,
    };
  }

  get rows(): any {
    const topRowCount = this.topRowIndex;
    const viewportSize = 25;
    const bottomRowCount = Math.max(0, this.props.dataSource.length - topRowCount - viewportSize);
    const dataRows = this.props.dataSource.slice(topRowCount, topRowCount + viewportSize);

    const topRows = topRowCount ? [{ [this.props.keyExpr]: 'virtual-top', height: topRowCount * this.rowHeight }] : [];
    const bottomRows = bottomRowCount ? [{ [this.props.keyExpr]: 'virtual-bottom', height: bottomRowCount * this.rowHeight }] : [];
    const rows = topRows.concat(dataRows).concat(bottomRows);
    return rows;
  }

  @Effect()
  subscribeToScroll(): () => void {
    const handleScroll = (e: any) => {
      this.topRowIndex = Math.floor((e.target.scrollTop + this.rowHeight - 1) / this.rowHeight);
    };

    eventsEngine.on(this.widgetRef, 'scroll', handleScroll);
    return (): void => eventsEngine.off(this.widgetRef, 'scroll', handleScroll);
  }

  handleScroll(e): void {
    this.topRowIndex = Math.floor((e.target.scrollTop + this.rowHeight - 1) / this.rowHeight);
  }
}