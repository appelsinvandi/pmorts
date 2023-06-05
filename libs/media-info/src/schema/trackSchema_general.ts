import { z } from 'zod'
import {
  dateSchema,
  yesNoBooleanSchema,
  encodableTextSchema,
} from './helpers/index.js'

export type MediaInfoTrackGeneral = z.infer<typeof trackSchema_general>
export const trackSchema_general = z
  .object({
    '@type': z.literal('General'),
    UniqueID: z.string().optional(),
    ID: z.coerce.number().int().nonnegative().transform(String).optional(),

    ContentType: z.enum(['Movie', 'Short Film', 'Unknown Type']).optional(),

    Title: z.string().optional(),
    Title_More: z.string().optional(),
    Description: z.string().optional(),
    Movie: z.string().optional(),
    Movie_More: z.string().optional(),
    Comment: encodableTextSchema.optional(),

    Cover: yesNoBooleanSchema.optional(),

    Season: z.coerce.number().int().nonnegative().optional(),
    Part: z.coerce.number().int().nonnegative().optional(),

    CoDirector: z.string().optional(),
    ProductionStudio: z.string().optional(),
    Performer: z.string().optional(),
    Album_Performer: z.string().optional(),

    Genre: z.enum(['Comedy']).optional(),

    AudioCount: z.coerce.number().int().nonnegative().default(0),
    MenuCount: z.coerce.number().int().nonnegative().default(0),
    OtherCount: z.coerce.number().int().nonnegative().default(0),
    TextCount: z.coerce.number().int().nonnegative().default(0),
    VideoCount: z.coerce.number().int().nonnegative().default(0),

    FileExtension: z
      .string()
      .transform((e) => e.toLowerCase())
      .pipe(z.enum(['avi', 'flv', 'mkv', 'mov', 'm4v', 'mp4', 'mpeg', 'wmv'])),

    Format: z.enum([
      'AVI',
      'Matroska',
      'MPEG-4',
      'Flash Video',
      'MPEG-PS',
      'MPEG-TS',
      'Windows Media',
    ]),
    Format_Version: z.coerce.number().positive().optional(),
    Format_Profile: z
      .enum([
        'Base Media',
        'Base Media / Version 2',
        'OpenDML',
        'QuickTime',
        'Sony PSP',
      ])
      .optional(),
    Format_Settings: z.enum(['BitmapInfoHeader / WaveFormatEx']).optional(),
    CodecID: z.enum(['isom', 'M4V ', 'MSNV', 'mp42', 'qt  ']).optional(),
    CodecID_Compatible: z
      .string()
      .transform((e) => e.split('/'))
      .pipe(
        z
          .enum([
            '3gp5',
            'avc1',
            'isom',
            'iso2',
            'M4A ',
            'M4V ',
            'MSNV',
            'mp41',
            'mp42',
            'qt  ',
          ])
          .array()
      )
      .optional(),
    CodecID_Version: z
      .string()
      .regex(/^\d{4}\.\d{2}$/, { message: 'does not match pattern' })
      .optional(),

    FileSize: z.coerce.number().int().positive(),
    StreamSize: z.coerce.number().int().positive().optional(),
    HeaderSize: z.coerce.number().int().positive().optional(),
    DataSize: z.coerce.number().int().positive().optional(),
    FooterSize: z.coerce.number().int().nonnegative().optional(),

    Interleaved: yesNoBooleanSchema.optional(),

    Duration: z.coerce.number().positive(),

    OverallBitRate_Mode: z.enum(['CBR', 'VBR']).optional(),
    OverallBitRate: z.coerce.number().int().positive(),
    OverallBitRate_Maximum: z.coerce.number().int().positive().optional(),

    FrameRate: z.coerce.number().positive().optional(),
    FrameCount: z.coerce.number().int().positive().optional(),

    IsStreamable: yesNoBooleanSchema.optional(),

    Encoded_Application: z.string().optional(),
    Copyright: z.string().optional(),
    Tagged_Application: z.string().optional(),

    EncodedBy: z.string().optional(),
    Encoded_Library: z.string().optional(),
    Encoded_Library_Name: z.string().optional(),

    Recorded_Date: dateSchema.optional(),

    extra: z.record(z.string()).optional(),

    Encoded_Date: dateSchema.optional(),
    Tagged_Date: dateSchema.optional(),
    File_Created_Date: dateSchema,
    File_Created_Date_Local: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/),
    File_Modified_Date: dateSchema,
    File_Modified_Date_Local: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/),
  })
  .strict()
