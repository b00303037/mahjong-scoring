import { Rule } from '../models/rule';
import { RuleGroup } from '../models/rule-group';

export function groupRules(rules: Array<Rule>): Array<RuleGroup> {
  return rules
    .reduce<Array<RuleGroup>>((groups, r) => {
      const existingGroup = groups.find((g) => g.points === r.points);

      if (existingGroup) {
        existingGroup.rules.push(r);
      } else {
        groups.push({
          points: r.points,
          rules: [r],
        });
      }

      return groups;
    }, [])
    .sort((a, b) => a.points - b.points);
}
