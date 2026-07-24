export default {
  greet: `Hello, {$name}!`,
  apples: `
  .input {$count :number}
  .match $count
    one {{ You have {$count} apple. }}
    *   {{ You have {$count} apples. }}`,
  test: `
  .input {$count :number}
  .match $count
    1 {{Hello, {$userName}! You have {$count} message.}}
    * {{Hello, {$userName}! You have {$count} messages.}}`,
  date1: `Date: {$date :fmtDate style=cool}`,
} as const
