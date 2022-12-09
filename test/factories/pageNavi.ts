import { faker } from "@faker-js/faker";
import { NavPoint, NavCell } from "~/services/pageNavigator";

export function buildNavPoint(): NavPoint {
  return [faker.datatype.number(), faker.datatype.number()];
}

export function buildNavCell(): NavCell {
  const cell: NavCell = {
    name: faker.lorem.word(),
    start: buildNavPoint(),
  };
  if (faker.datatype.boolean()) {
    cell["end"] = buildNavPoint();
  }
  return cell;
}
