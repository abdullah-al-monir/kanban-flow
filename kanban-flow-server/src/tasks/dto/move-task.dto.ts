import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class MoveTaskDto {
  @ApiProperty({
    description:
      'Column the task should end up in (same as current column for a pure reorder)',
  })
  @IsUUID()
  targetColumnId: string;

  @ApiProperty({
    description:
      "0-based index the task should occupy within the target column's task list, AFTER the move (matches what drag-and-drop libraries like @formkit/drag-and-drop report on drop).",
    example: 2,
  })
  @IsInt()
  @Min(0)
  targetIndex: number;
}
